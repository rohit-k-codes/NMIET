import { z } from 'zod';

/**
 * Tool 1: inspect_energy_data
 */
export const InspectEnergyDataSchema = z.object({
  zone: z.string().describe('Target zone or "all" to inspect'),
  time_window: z.enum(['all', 'off_hours', 'peak', 'weekend']).default('all').describe('Filter observations by operational time window'),
  anomaly_type: z.enum(['all', 'off_hours_waste', 'statistical_spike', 'weekend_ghost_load', 'continuous_basal_drift']).default('all').describe('Filter by detected anomaly type'),
});

export type InspectEnergyDataArgs = z.infer<typeof InspectEnergyDataSchema>;

/**
 * Tool 2: calculate_savings_scenario
 */
export const CalculateSavingsScenarioSchema = z.object({
  target_reduction_pct: z.number().min(1).max(100).describe('Target reduction percentage of identified waste (1-100)'),
  electricity_tariff: z.number().min(0.01).max(10.0).describe('Electricity tariff in currency per kWh (e.g. 0.20)'),
  target_zone: z.string().optional().describe('Target zone or leave empty for all campus zones'),
});

export type CalculateSavingsScenarioArgs = z.infer<typeof CalculateSavingsScenarioSchema>;

/**
 * Tool 3: draft_maintenance_task
 */
export const DraftMaintenanceTaskSchema = z.object({
  finding_id: z.string().describe('ID of the anomaly finding being addressed (e.g. "ANO-CAM-1012-OFF")'),
  zone: z.string().describe('Campus building / zone name'),
  title: z.string().describe('Clear, professional maintenance action title'),
  urgency: z.enum(['low', 'medium', 'high', 'critical']).describe('Urgency level for campus facilities'),
  category: z.enum(['hvac_scheduling', 'lighting_retrofit', 'submetering', 'equipment_fault', 'operational_policy']).describe('Technical intervention category'),
  recommended_steps: z.array(z.string()).min(1).describe('Ordered list of concrete verification and remediation steps'),
  estimated_kwh_reduction: z.number().nonnegative().describe('Estimated achievable kWh reduction per week/cycle'),
  implementation_effort: z.enum(['low', 'medium', 'high']).describe('Facility effort: low (software/setpoint), medium (sensor/actuator), high (capital overhaul)'),
  confidence_score: z.number().min(0).max(1).describe('Confidence score between 0.0 and 1.0 grounded in empirical data'),
  rationale: z.string().describe('Explicit explanation of why this action was generated based on the measured findings'),
});

export type DraftMaintenanceTaskArgs = z.infer<typeof DraftMaintenanceTaskSchema>;

/**
 * Official Tool Declarations for Google GenAI / Gemini 3.8 Flash
 */
export const GEMINI_TOOLS_DECLARATION = [
  {
    type: 'function',
    name: 'inspect_energy_data',
    description: 'Retrieves verified empirical metrics, zone baselines, and detected anomaly findings from the validated dataset.',
    parameters: {
      type: 'object',
      properties: {
        zone: {
          type: 'string',
          description: 'Name of the zone/building to inspect (e.g. "Campus Library", "Engineering Hall", or "all")',
        },
        time_window: {
          type: 'string',
          enum: ['all', 'off_hours', 'peak', 'weekend'],
          description: 'Operational timeframe filter',
        },
        anomaly_type: {
          type: 'string',
          enum: ['all', 'off_hours_waste', 'statistical_spike', 'weekend_ghost_load', 'continuous_basal_drift'],
          description: 'Specific anomaly rule filter',
        },
      },
      required: ['zone'],
    },
  },
  {
    type: 'function',
    name: 'calculate_savings_scenario',
    description: 'Calculates potential energy and cost savings using deterministic mathematical formulas and configured tariff assumptions.',
    parameters: {
      type: 'object',
      properties: {
        target_reduction_pct: {
          type: 'number',
          description: 'Hypothetical reduction percentage of identified waste (1-100)',
        },
        electricity_tariff: {
          type: 'number',
          description: 'Electricity cost in $/kWh (e.g., 0.18)',
        },
        target_zone: {
          type: 'string',
          description: 'Optional zone filter to narrow calculations',
        },
      },
      required: ['target_reduction_pct', 'electricity_tariff'],
    },
  },
  {
    type: 'function',
    name: 'draft_maintenance_task',
    description: 'Creates a proposed human-in-the-loop maintenance task card for an identified energy anomaly.',
    parameters: {
      type: 'object',
      properties: {
        finding_id: {
          type: 'string',
          description: 'ID of the anomaly finding being addressed',
        },
        zone: {
          type: 'string',
          description: 'Facility zone name',
        },
        title: {
          type: 'string',
          description: 'Descriptive title of the intervention',
        },
        urgency: {
          type: 'string',
          enum: ['low', 'medium', 'high', 'critical'],
          description: 'Urgency level',
        },
        category: {
          type: 'string',
          enum: ['hvac_scheduling', 'lighting_retrofit', 'submetering', 'equipment_fault', 'operational_policy'],
          description: 'Intervention domain',
        },
        recommended_steps: {
          type: 'array',
          items: { type: 'string' },
          description: 'Specific step-by-step implementation directions',
        },
        estimated_kwh_reduction: {
          type: 'number',
          description: 'Achievable energy reduction in kWh',
        },
        implementation_effort: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Estimated effort',
        },
        confidence_score: {
          type: 'number',
          description: 'Confidence score (0.0 to 1.0)',
        },
        rationale: {
          type: 'string',
          description: 'Scientific and data-grounded rationale for the task',
        },
      },
      required: [
        'finding_id',
        'zone',
        'title',
        'urgency',
        'category',
        'recommended_steps',
        'estimated_kwh_reduction',
        'implementation_effort',
        'confidence_score',
        'rationale',
      ],
    },
  },
];
