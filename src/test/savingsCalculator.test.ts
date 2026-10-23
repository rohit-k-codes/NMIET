import { describe, it, expect } from 'vitest';
import { calculateSavingsScenario } from '../utils/savingsCalculator';
import { calculateDatasetAnalytics } from '../utils/analytics';
import { generateDemoCampusReadings } from '../data/demoDataset';

describe('Explainable Savings Calculator Suite', () => {
  const demoReadings = generateDemoCampusReadings();
  const analytics = calculateDatasetAnalytics(demoReadings, true);

  it('calculates deterministic energy and cost savings accurately', () => {
    const scenario = {
      targetReductionPct: 20,
      electricityTariff: 0.25,
      targetZone: 'all',
    };

    const result = calculateSavingsScenario(analytics, scenario);

    expect(result.eligibleBaselineWasteKwh).toBeCloseTo(analytics.totalWasteKwh, 0);
    expect(result.energySavingsKwh).toBeCloseTo(analytics.totalWasteKwh * 0.20, 0);
    expect(result.costSavingsCurrency).toBeCloseTo(result.energySavingsKwh * 0.25, 0);
    expect(result.annualEnergySavingsKwh).toBeGreaterThan(result.energySavingsKwh);
    expect(result.formula).toContain('Energy Savings');
    expect(result.isEstimated).toBe(true);
  });

  it('clamps invalid reduction percentages safely between 1% and 100%', () => {
    // Test negative reduction
    const negativeRes = calculateSavingsScenario(analytics, {
      targetReductionPct: -50,
      electricityTariff: 0.20,
    });
    expect(negativeRes.scenario.targetReductionPct).toBe(1);

    // Test excessive reduction (>100%)
    const excessiveRes = calculateSavingsScenario(analytics, {
      targetReductionPct: 250,
      electricityTariff: 0.20,
    });
    expect(excessiveRes.scenario.targetReductionPct).toBe(100);
  });

  it('safely handles non-positive tariffs by enforcing minimum floor', () => {
    const res = calculateSavingsScenario(analytics, {
      targetReductionPct: 15,
      electricityTariff: -0.10,
    });
    expect(res.scenario.electricityTariff).toBe(0.01);
  });

  it('scopes calculation to a single target facility when specified', () => {
    const singleZone = analytics.zones[0];
    const result = calculateSavingsScenario(analytics, {
      targetReductionPct: 15,
      electricityTariff: 0.20,
      targetZone: singleZone,
    });

    const expectedZoneWaste = analytics.anomalies
      .filter((a) => a.zone === singleZone)
      .reduce((sum, a) => sum + a.excessKwh, 0);

    expect(result.eligibleBaselineWasteKwh).toBeCloseTo(expectedZoneWaste, 2);
    expect(result.scenario.targetZone).toBe(singleZone);
  });
});
