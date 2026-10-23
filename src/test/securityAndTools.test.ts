import { describe, it, expect } from 'vitest';
import { executeTool } from '../../server/tools/executor';
import { generateDeterministicOptimizationPlan } from '../../server/services/fallbackAgent';
import { calculateDatasetAnalytics } from '../utils/analytics';
import { generateDemoCampusReadings } from '../data/demoDataset';
import { ActionTask } from '../types/energy';

describe('Security & Tool Sandboxing Suite', () => {
  const demoReadings = generateDemoCampusReadings();
  const analytics = calculateDatasetAnalytics(demoReadings, true);

  it('strictly rejects malicious or unauthorized tool names', async () => {
    const draftTasks: ActionTask[] = [];
    const response = await executeTool(
      'execute_bash_command',
      { command: 'rm -rf /' },
      analytics,
      draftTasks
    );

    expect(response.success).toBe(false);
    expect(response.error).toContain('Security Policy Violation');
    expect(draftTasks.length).toBe(0);
  });

  it('rejects another unknown tool name', async () => {
    const draftTasks: ActionTask[] = [];
    const response = await executeTool(
      'send_sms_to_facilities',
      { phone: '+123456789' },
      analytics,
      draftTasks
    );

    expect(response.success).toBe(false);
    expect(response.error).toContain('not in the allowlist');
  });

  it('executes allowlisted inspect_energy_data tool with valid parameters', async () => {
    const draftTasks: ActionTask[] = [];
    const response = await executeTool(
      'inspect_energy_data',
      { zone: analytics.zones[0], time_window: 'all', anomaly_type: 'all' },
      analytics,
      draftTasks
    );

    expect(response.success).toBe(true);
    expect(response.result).toBeDefined();
    expect(response.result?.inspectedZone).toBe(analytics.zones[0]);
  });

  it('executes allowlisted calculate_savings_scenario tool with valid parameters', async () => {
    const draftTasks: ActionTask[] = [];
    const response = await executeTool(
      'calculate_savings_scenario',
      { target_reduction_pct: 15, electricity_tariff: 0.20 },
      analytics,
      draftTasks
    );

    expect(response.success).toBe(true);
    expect(response.result?.achievableEnergySavingsKwh).toBeDefined();
  });

  it('executes draft_maintenance_task and rejects fabricated/hallucinated zones', async () => {
    const draftTasks: ActionTask[] = [];
    const fakeZoneRes = await executeTool(
      'draft_maintenance_task',
      {
        finding_id: 'ANO-123',
        zone: 'Fictional Building 99', // doesn't exist
        title: 'Fix Chiller',
        urgency: 'high',
        category: 'equipment_fault',
        recommended_steps: ['Check motor'],
        estimated_kwh_reduction: 50,
        implementation_effort: 'medium',
        confidence_score: 0.9,
        rationale: 'Faulty chiller observed',
      },
      analytics,
      draftTasks
    );

    expect(fakeZoneRes.success).toBe(false);
    expect(fakeZoneRes.error).toContain('does not exist in the analyzed dataset');
    expect(draftTasks.length).toBe(0);
  });

  it('executes draft_maintenance_task successfully for real campus zone', async () => {
    const draftTasks: ActionTask[] = [];
    const validZone = analytics.zones[0];
    const res = await executeTool(
      'draft_maintenance_task',
      {
        finding_id: 'ANO-TEST',
        zone: validZone,
        title: `Audit HVAC in ${validZone}`,
        urgency: 'high',
        category: 'hvac_scheduling',
        recommended_steps: ['Check BAS setpoint', 'Inspect damper'],
        estimated_kwh_reduction: 80,
        implementation_effort: 'low',
        confidence_score: 0.95,
        rationale: 'High off-hours draw observed during zero occupancy',
      },
      analytics,
      draftTasks
    );

    expect(res.success).toBe(true);
    expect(draftTasks.length).toBe(1);
    expect(draftTasks[0].zone).toBe(validZone);
    expect(draftTasks[0].status).toBe('pending');
  });

  it('deterministic fallback agent produces structured plan with execution logs', async () => {
    const plan = await generateDeterministicOptimizationPlan(analytics, 'Maximize Energy Conservation', 0.20);

    expect(plan.usedFallback).toBe(true);
    expect(plan.modelUsed).toBe('deterministic-rule-engine-v1');
    expect(plan.actions.length).toBeGreaterThan(0);
    expect(plan.executionLogs.length).toBeGreaterThan(0);
    expect(plan.overallConfidence).toBeGreaterThanOrEqual(0.9);
  });
});
