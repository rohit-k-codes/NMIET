/**
 * WattWise AI - Domain Types
 * Campus Energy Optimization Platform
 */

export interface EnergyReading {
  timestamp: string; // ISO 8601 string or YYYY-MM-DD HH:mm:ss
  site: string;      // Campus site / complex (e.g. "North Campus", "Main Campus")
  zone: string;      // Building / zone (e.g. "Engineering Hall", "Library")
  kwh: number;       // Measured electricity consumption in kilowatt-hours
  occupancy?: number;// Estimated or sensor-reported headcount (optional)
}

export type AnomalyRule =
  | 'off_hours_waste'
  | 'statistical_spike'
  | 'weekend_ghost_load'
  | 'continuous_basal_drift';

export interface AnomalyFinding {
  id: string;
  zone: string;
  site: string;
  timestamp: string;
  kwh: number;
  baselineKwh: number;
  excessKwh: number;
  deviationPct: number;
  rule: AnomalyRule;
  ruleLabel: string;
  severity: 'high' | 'medium' | 'low';
  explanation: string;
  evidence: {
    metric: string;
    observed: number;
    threshold: number;
    unit: string;
    occupancy?: number;
    isOffHours?: boolean;
    isWeekend?: boolean;
  };
}

export interface ZoneSummary {
  zone: string;
  site: string;
  totalKwh: number;
  avgKwh: number;
  peakKwh: number;
  offHoursKwh: number;
  minKwh: number;
  maxKwh: number;
  readingsCount: number;
  meanOccupancy: number;
  anomaliesCount: number;
  totalWasteKwh: number;
}

export interface DatasetAnalytics {
  totalKwh: number;
  avgKwh: number;
  medianKwh: number;
  minKwh: number;
  maxKwh: number;
  readingsCount: number;
  zoneCount: number;
  siteCount: number;
  zones: string[];
  sites: string[];
  zoneSummaries: Record<string, ZoneSummary>;
  anomalies: AnomalyFinding[];
  totalWasteKwh: number;
  timeWindow: {
    start: string;
    end: string;
    durationHours: number;
    daysCount: number;
  };
  peakHoursKwh: number;
  offHoursKwh: number;
  weekendKwh: number;
  weekdayKwh: number;
  isDemoData: boolean;
  clientProcessingDurationMs: number;
}

export interface SavingsScenario {
  targetReductionPct: number; // e.g., 15 for 15%
  electricityTariff: number;   // $/kWh, e.g., 0.20
  targetZone?: string;        // optional zone filter
}

export interface SavingsResult {
  scenario: SavingsScenario;
  eligibleBaselineWasteKwh: number;
  scaledAnnualWasteKwh: number;
  energySavingsKwh: number;
  annualEnergySavingsKwh: number;
  costSavingsCurrency: number;
  annualCostSavingsCurrency: number;
  formula: string;
  carbonReductionEstimateKg: number; // calculated transparently using grid factor
  isEstimated: true;
}

export type ActionCategory =
  | 'hvac_scheduling'
  | 'lighting_retrofit'
  | 'submetering'
  | 'equipment_fault'
  | 'operational_policy';

export type ActionUrgency = 'low' | 'medium' | 'high' | 'critical';
export type ActionEffort = 'low' | 'medium' | 'high';
export type ActionStatus = 'pending' | 'approved' | 'dismissed';

export interface ActionTask {
  id: string;
  findingId?: string;
  title: string;
  zone: string;
  urgency: ActionUrgency;
  category: ActionCategory;
  status: ActionStatus;
  implementationEffort: ActionEffort;
  confidenceScore: number; // 0.0 - 1.0
  estimatedKwhReduction: number;
  estimatedCostSavings: number;
  recommendedSteps: string[];
  rationale: string;
  createdAt: string;
  reviewedAt?: string;
  reviewDecisionNote?: string;
}

export interface AgentExecutionLog {
  id: string;
  timestamp: string;
  type: 'reasoning' | 'tool_call' | 'tool_result' | 'output' | 'system';
  content: string;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  toolResult?: Record<string, unknown>;
}

export interface AgentOptimizationPlan {
  strategySummary: string;
  identifiedWasteSummary: string;
  actions: ActionTask[];
  overallConfidence: number;
  missingDataWarnings: string[];
  executionLogs: AgentExecutionLog[];
  latencyMs: number;
  usedFallback: boolean;
  modelUsed: string;
}

export interface SystemDiagnostics {
  csvRowsProcessed: number;
  clientAnalyticsDurationMs: number;
  backendLatencyMs: number;
  aiRequestsCount: number;
  toolInvocationsCount: number;
  validationErrorsCount: number;
  isFallbackMode: boolean;
  lastRunTimestamp: string;
  sessionAuditCount: number;
}

export interface SessionAuditEntry {
  id: string;
  timestamp: string;
  type: 'DATA_IMPORT' | 'ANALYTICS_RUN' | 'AGENT_INVOCATION' | 'ACTION_APPROVED' | 'ACTION_DISMISSED' | 'REPORT_EXPORTED';
  description: string;
  details?: Record<string, unknown>;
}
