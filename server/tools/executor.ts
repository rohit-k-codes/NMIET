import { DatasetAnalytics, ActionTask } from '../../src/types/energy';
import { calculateSavingsScenario } from '../../src/utils/savingsCalculator';
import {
  InspectEnergyDataSchema,
  CalculateSavingsScenarioSchema,
  DraftMaintenanceTaskSchema,
} from './definitions';

export interface ToolExecutionResponse {
  success: boolean;
  toolName: string;
  result?: Record<string, unknown>;
  error?: string;
}

/**
 * Executes allowlisted tools strictly with parameter validation and in-memory analytics isolation
 */
export async function executeTool(
  toolName: string,
  rawArgs: unknown,
  analytics: DatasetAnalytics,
  draftTasks: ActionTask[]
): Promise<ToolExecutionResponse> {
  try {
    switch (toolName) {
      case 'inspect_energy_data': {
        const validated = InspectEnergyDataSchema.parse(rawArgs);
        const { zone, time_window, anomaly_type } = validated;

        let filteredAnomalies = analytics.anomalies;
        if (zone && zone !== 'all') {
          filteredAnomalies = filteredAnomalies.filter(
            (a) => a.zone.toLowerCase() === zone.toLowerCase()
          );
        }
        if (anomaly_type && anomaly_type !== 'all') {
          filteredAnomalies = filteredAnomalies.filter((a) => a.rule === anomaly_type);
        }

        const relevantZoneSummaries =
          zone && zone !== 'all'
            ? Object.entries(analytics.zoneSummaries)
                .filter(([zName]) => zName.toLowerCase() === zone.toLowerCase())
                .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {})
            : analytics.zoneSummaries;

        return {
          success: true,
          toolName,
          result: {
            inspectedZone: zone,
            timeWindow: time_window,
            anomalyCount: filteredAnomalies.length,
            findings: filteredAnomalies.map((a) => ({
              id: a.id,
              zone: a.zone,
              timestamp: a.timestamp,
              kwh: a.kwh,
              baselineKwh: a.baselineKwh,
              excessKwh: a.excessKwh,
              rule: a.rule,
              severity: a.severity,
              explanation: a.explanation,
            })),
            zoneSummaries: relevantZoneSummaries,
            totalWasteKwhInScope: filteredAnomalies.reduce((sum, a) => sum + a.excessKwh, 0),
          },
        };
      }

      case 'calculate_savings_scenario': {
        const validated = CalculateSavingsScenarioSchema.parse(rawArgs);
        const result = calculateSavingsScenario(analytics, {
          targetReductionPct: validated.target_reduction_pct,
          electricityTariff: validated.electricity_tariff,
          targetZone: validated.target_zone,
        });

        return {
          success: true,
          toolName,
          result: {
            targetReductionPct: result.scenario.targetReductionPct,
            tariffRate: result.scenario.electricityTariff,
            targetZone: result.scenario.targetZone || 'all_zones',
            eligibleBaselineWasteKwh: result.eligibleBaselineWasteKwh,
            achievableEnergySavingsKwh: result.energySavingsKwh,
            annualEnergySavingsKwh: result.annualEnergySavingsKwh,
            estimatedCostSavings: result.costSavingsCurrency,
            annualCostSavings: result.annualCostSavingsCurrency,
            carbonReductionKg: result.carbonReductionEstimateKg,
            formula: result.formula,
            disclaimer: 'Calculated deterministically. Outcomes are scenario estimates based on measured excess consumption.',
          },
        };
      }

      case 'draft_maintenance_task': {
        const validated = DraftMaintenanceTaskSchema.parse(rawArgs);

        // Security check: Verify zone exists in the dataset
        const zoneExists = analytics.zones.some(
          (z) => z.toLowerCase() === validated.zone.toLowerCase()
        );
        if (!zoneExists) {
          return {
            success: false,
            toolName,
            error: `Validation Error: Zone "${validated.zone}" does not exist in the analyzed dataset. Tools cannot fabricate external facilities.`,
          };
        }

        const task: ActionTask = {
          id: `TASK-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`.toUpperCase(),
          findingId: validated.finding_id,
          title: validated.title,
          zone: validated.zone,
          urgency: validated.urgency,
          category: validated.category,
          status: 'pending',
          implementationEffort: validated.implementation_effort,
          confidenceScore: validated.confidence_score,
          estimatedKwhReduction: validated.estimated_kwh_reduction,
          estimatedCostSavings: Number((validated.estimated_kwh_reduction * 0.20).toFixed(2)), // standard tariff reference
          recommendedSteps: validated.recommended_steps,
          rationale: validated.rationale,
          createdAt: new Date().toISOString(),
        };

        draftTasks.push(task);

        return {
          success: true,
          toolName,
          result: {
            taskId: task.id,
            status: 'drafted_in_session_memory',
            title: task.title,
            zone: task.zone,
            urgency: task.urgency,
            estimatedKwhReduction: task.estimatedKwhReduction,
            message: 'Task successfully drafted for human review in Action Center. No external commands dispatched.',
          },
        };
      }

      default:
        return {
          success: false,
          toolName,
          error: `Security Policy Violation: Tool "${toolName}" is not in the allowlist. Only approved tools may be executed.`,
        };
    }
  } catch (err: any) {
    return {
      success: false,
      toolName,
      error: `Parameter validation failure: ${err.message || String(err)}`,
    };
  }
}
