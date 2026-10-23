import { DatasetAnalytics, SavingsResult, SavingsScenario } from '../types/energy';

// EPA regional grid emission intensity factor (~0.385 kg CO2e / kWh)
const EPA_GRID_EMISSION_FACTOR_KG_PER_KWH = 0.385;

/**
 * Calculates deterministic energy and cost savings under a user-defined scenario
 */
export function calculateSavingsScenario(
  analytics: DatasetAnalytics,
  scenario: SavingsScenario
): SavingsResult {
  const { targetReductionPct, electricityTariff, targetZone } = scenario;

  // Validate inputs
  const clampedReductionPct = Math.min(100, Math.max(1, Number(targetReductionPct) || 15));
  const clampedTariff = Math.max(0.01, Number(electricityTariff) || 0.18);

  // Filter anomalies by zone if requested
  const relevantAnomalies = targetZone && targetZone !== 'all'
    ? analytics.anomalies.filter((a) => a.zone === targetZone)
    : analytics.anomalies;

  const eligibleBaselineWasteKwh = relevantAnomalies.reduce((sum, a) => sum + a.excessKwh, 0);

  // Scale to annual equivalent using actual dataset duration
  const daysInSample = Math.max(0.5, analytics.timeWindow.daysCount || 7);
  const annualScalingFactor = 365 / daysInSample;
  const scaledAnnualWasteKwh = eligibleBaselineWasteKwh * annualScalingFactor;

  // Compute energy savings
  const reductionRatio = clampedReductionPct / 100;
  const energySavingsKwh = eligibleBaselineWasteKwh * reductionRatio;
  const annualEnergySavingsKwh = scaledAnnualWasteKwh * reductionRatio;

  // Compute cost savings
  const costSavingsCurrency = energySavingsKwh * clampedTariff;
  const annualCostSavingsCurrency = annualEnergySavingsKwh * clampedTariff;

  // Carbon reduction estimate
  const carbonReductionEstimateKg = annualEnergySavingsKwh * EPA_GRID_EMISSION_FACTOR_KG_PER_KWH;

  const formula = `Energy Savings (kWh) = Eligible Waste (${eligibleBaselineWasteKwh.toFixed(1)} kWh) × Target Reduction (${clampedReductionPct}%) = ${energySavingsKwh.toFixed(1)} kWh. ` +
    `Cost Savings = ${energySavingsKwh.toFixed(1)} kWh × $${clampedTariff.toFixed(2)}/kWh = $${costSavingsCurrency.toFixed(2)}. ` +
    `Annualized = $${costSavingsCurrency.toFixed(2)} × (${(365 / daysInSample).toFixed(1)} scaling) = $${annualCostSavingsCurrency.toFixed(2)}/year.`;

  return {
    scenario: {
      targetReductionPct: clampedReductionPct,
      electricityTariff: clampedTariff,
      targetZone,
    },
    eligibleBaselineWasteKwh: Number(eligibleBaselineWasteKwh.toFixed(2)),
    scaledAnnualWasteKwh: Number(scaledAnnualWasteKwh.toFixed(2)),
    energySavingsKwh: Number(energySavingsKwh.toFixed(2)),
    annualEnergySavingsKwh: Number(annualEnergySavingsKwh.toFixed(2)),
    costSavingsCurrency: Number(costSavingsCurrency.toFixed(2)),
    annualCostSavingsCurrency: Number(annualCostSavingsCurrency.toFixed(2)),
    formula,
    carbonReductionEstimateKg: Number(carbonReductionEstimateKg.toFixed(1)),
    isEstimated: true,
  };
}
