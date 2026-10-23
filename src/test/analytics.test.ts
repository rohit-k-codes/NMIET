import { describe, it, expect } from 'vitest';
import { calculateDatasetAnalytics, isOffHours, isWeekend, isPeakHours } from '../utils/analytics';
import { EnergyReading } from '../types/energy';
import { generateDemoCampusReadings } from '../data/demoDataset';

describe('Deterministic Analytics Engine Suite', () => {
  it('correctly calculates totals, averages, medians, and extremes', () => {
    const mockReadings: EnergyReading[] = [
      { timestamp: '2026-10-15T08:00:00Z', site: 'Campus', zone: 'Hall A', kwh: 10, occupancy: 20 },
      { timestamp: '2026-10-15T09:00:00Z', site: 'Campus', zone: 'Hall A', kwh: 20, occupancy: 40 },
      { timestamp: '2026-10-15T10:00:00Z', site: 'Campus', zone: 'Hall A', kwh: 30, occupancy: 60 },
      { timestamp: '2026-10-15T11:00:00Z', site: 'Campus', zone: 'Hall A', kwh: 40, occupancy: 80 },
      { timestamp: '2026-10-15T12:00:00Z', site: 'Campus', zone: 'Hall A', kwh: 50, occupancy: 100 },
    ];

    const analytics = calculateDatasetAnalytics(mockReadings, false);

    expect(analytics.totalKwh).toBe(150);
    expect(analytics.avgKwh).toBe(30);
    expect(analytics.medianKwh).toBe(30);
    expect(analytics.minKwh).toBe(10);
    expect(analytics.maxKwh).toBe(50);
    expect(analytics.zoneCount).toBe(1);
    expect(analytics.readingsCount).toBe(5);
  });

  it('correctly identifies off-hours, weekend, and peak time boundaries', () => {
    // 03:00 is off-hours
    const night = new Date('2026-10-15T03:00:00Z');
    expect(isOffHours(night)).toBe(true);

    // 14:00 is not off-hours
    const afternoon = new Date('2026-10-15T14:00:00Z');
    expect(isOffHours(afternoon)).toBe(false);

    // 2026-10-18 is Sunday (weekend)
    const sunday = new Date('2026-10-18T12:00:00Z');
    expect(isWeekend(sunday)).toBe(true);

    // 2026-10-15 is Thursday (weekday peak at 14:00)
    const weekdayPeak = new Date('2026-10-15T14:00:00Z');
    expect(isPeakHours(weekdayPeak)).toBe(true);
  });

  it('detects off-hours unoccupied waste when reading is high with zero occupancy', () => {
    const readings: EnergyReading[] = [];

    // Normal daytime readings
    for (let h = 8; h <= 17; h++) {
      readings.push({
        timestamp: `2026-10-14T${String(h).padStart(2, '0')}:00:00Z`,
        site: 'Central',
        zone: 'Library',
        kwh: 50,
        occupancy: 100,
      });
    }

    // Baseline night reading
    readings.push({
      timestamp: '2026-10-14T01:00:00Z',
      site: 'Central',
      zone: 'Library',
      kwh: 10,
      occupancy: 0,
    });

    // Anomaly night reading: 45 kWh at 03:00 AM with 0 occupancy
    readings.push({
      timestamp: '2026-10-14T03:00:00Z',
      site: 'Central',
      zone: 'Library',
      kwh: 45,
      occupancy: 0,
    });

    const result = calculateDatasetAnalytics(readings, false);
    const nightAnomaly = result.anomalies.find((a) => a.rule === 'off_hours_waste');

    expect(nightAnomaly).toBeDefined();
    expect(nightAnomaly?.zone).toBe('Library');
    expect(nightAnomaly?.kwh).toBe(45);
    expect(nightAnomaly?.evidence.occupancy).toBe(0);
    expect(nightAnomaly?.excessKwh).toBeGreaterThan(20);
  });

  it('detects statistical spikes that exceed 2.5 standard deviations', () => {
    const readings: EnergyReading[] = [];

    // 20 readings with steady mean ~20 and low variance
    for (let i = 0; i < 20; i++) {
      readings.push({
        timestamp: `2026-10-15T${String(i % 24).padStart(2, '0')}:00:00`,
        site: 'Central',
        zone: 'Data Center',
        kwh: 20 + (i % 2),
        occupancy: 5,
      });
    }

    // Huge spike: 95 kWh
    readings.push({
      timestamp: '2026-10-15T23:00:00',
      site: 'Central',
      zone: 'Data Center',
      kwh: 95,
      occupancy: 5,
    });

    const result = calculateDatasetAnalytics(readings, false);
    const spike = result.anomalies.find((a) => a.rule === 'statistical_spike');

    expect(spike).toBeDefined();
    expect(spike?.kwh).toBe(95);
    expect(spike?.severity).toBe('high');
  });

  it('runs deterministically and identifies known anomalies in built-in demo dataset', () => {
    const demo = generateDemoCampusReadings();
    expect(demo.length).toBe(840); // 168 hours * 5 zones

    const analytics = calculateDatasetAnalytics(demo, true);
    expect(analytics.anomalies.length).toBeGreaterThan(0);
    expect(analytics.zoneCount).toBe(5);
    expect(analytics.totalWasteKwh).toBeGreaterThan(100);
    expect(analytics.isDemoData).toBe(true);
  });
});
