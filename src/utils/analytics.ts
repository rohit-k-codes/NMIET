import {
  EnergyReading,
  AnomalyFinding,
  ZoneSummary,
  DatasetAnalytics,
} from '../types/energy';

/**
 * Calculates standard deviation for an array of numbers
 */
function calculateStdDev(values: number[], mean: number): number {
  if (values.length <= 1) return 0;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/**
 * Calculates median for an array of numbers
 */
function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Inspects timestamp to determine if it falls within off-hours (22:00 - 06:00 local)
 */
export function isOffHours(date: Date): boolean {
  const hour = date.getUTCHours();
  return hour >= 22 || hour < 6;
}

/**
 * Inspects timestamp to determine if it is a weekend (Saturday = 6, Sunday = 0)
 */
export function isWeekend(date: Date): boolean {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

/**
 * Inspects timestamp to determine peak daytime hours (08:00 - 18:00 on weekdays)
 */
export function isPeakHours(date: Date): boolean {
  const hour = date.getUTCHours();
  return !isWeekend(date) && hour >= 8 && hour < 18;
}

/**
 * Core Deterministic Analytics Engine for Campus Energy Datasets
 */
export function calculateDatasetAnalytics(
  readings: EnergyReading[],
  isDemoData: boolean = false
): DatasetAnalytics {
  const startTime = performance.now();

  if (readings.length === 0) {
    throw new Error('Cannot analyze empty readings dataset');
  }

  // 1. Sort readings chronologically
  const sortedReadings = [...readings].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const kwhValues = sortedReadings.map((r) => r.kwh);
  const totalKwh = kwhValues.reduce((sum, val) => sum + val, 0);
  const avgKwh = totalKwh / kwhValues.length;
  const medianKwh = calculateMedian(kwhValues);
  const minKwh = Math.min(...kwhValues);
  const maxKwh = Math.max(...kwhValues);

  // Group by zones and sites
  const zonesSet = new Set<string>();
  const sitesSet = new Set<string>();
  const zoneReadingsMap: Record<string, EnergyReading[]> = {};

  let peakHoursKwh = 0;
  let offHoursKwh = 0;
  let weekendKwh = 0;
  let weekdayKwh = 0;

  for (const r of sortedReadings) {
    zonesSet.add(r.zone);
    sitesSet.add(r.site);

    if (!zoneReadingsMap[r.zone]) {
      zoneReadingsMap[r.zone] = [];
    }
    zoneReadingsMap[r.zone].push(r);

    const date = new Date(r.timestamp);
    if (isWeekend(date)) {
      weekendKwh += r.kwh;
    } else {
      weekdayKwh += r.kwh;
    }

    if (isPeakHours(date)) {
      peakHoursKwh += r.kwh;
    } else if (isOffHours(date)) {
      offHoursKwh += r.kwh;
    }
  }

  const zones = Array.from(zonesSet);
  const sites = Array.from(sitesSet);

  // 2. Zone-level statistics and baseline profiling
  const zoneSummaries: Record<string, ZoneSummary> = {};
  const zoneStats: Record<
    string,
    {
      mean: number;
      median: number;
      stdDev: number;
      daytimeMean: number;
      offHoursMean: number;
      offHoursP25: number;
      peakKwh: number;
      minKwh: number;
      maxKwh: number;
      weekdayDaytimeMean: number;
      weekdayPeakOccupancy: number;
    }
  > = {};

  for (const zone of zones) {
    const zReadings = zoneReadingsMap[zone];
    const zKwhs = zReadings.map((r) => r.kwh);
    const zTotal = zKwhs.reduce((a, b) => a + b, 0);
    const zAvg = zTotal / zKwhs.length;
    const zStdDev = calculateStdDev(zKwhs, zAvg);
    const zMedian = calculateMedian(zKwhs);

    let zOffHoursTotal = 0;
    let zOffHoursCount = 0;
    const zOffHoursValues: number[] = [];

    let zDaytimeTotal = 0;
    let zDaytimeCount = 0;

    let zWeekdayDaytimeTotal = 0;
    let zWeekdayDaytimeCount = 0;

    let zOccupancyTotal = 0;
    let zOccupancyCount = 0;
    let zMaxWeekdayOccupancy = 0;

    for (const r of zReadings) {
      const d = new Date(r.timestamp);
      if (isOffHours(d)) {
        zOffHoursTotal += r.kwh;
        zOffHoursCount++;
        zOffHoursValues.push(r.kwh);
      } else {
        zDaytimeTotal += r.kwh;
        zDaytimeCount++;
      }

      if (!isWeekend(d) && isPeakHours(d)) {
        zWeekdayDaytimeTotal += r.kwh;
        zWeekdayDaytimeCount++;
        if (r.occupancy !== undefined && r.occupancy > zMaxWeekdayOccupancy) {
          zMaxWeekdayOccupancy = r.occupancy;
        }
      }

      if (r.occupancy !== undefined) {
        zOccupancyTotal += r.occupancy;
        zOccupancyCount++;
      }
    }

    const daytimeMean = zDaytimeCount > 0 ? zDaytimeTotal / zDaytimeCount : zAvg;
    const offHoursMean = zOffHoursCount > 0 ? zOffHoursTotal / zOffHoursCount : zAvg * 0.2;
    const offHoursP25 = zOffHoursValues.length > 0 ? calculateMedian(zOffHoursValues) * 0.85 : offHoursMean * 0.8;
    const weekdayDaytimeMean = zWeekdayDaytimeCount > 0 ? zWeekdayDaytimeTotal / zWeekdayDaytimeCount : daytimeMean;

    zoneStats[zone] = {
      mean: zAvg,
      median: zMedian,
      stdDev: zStdDev,
      daytimeMean,
      offHoursMean,
      offHoursP25,
      peakKwh: Math.max(...zKwhs),
      minKwh: Math.min(...zKwhs),
      maxKwh: Math.max(...zKwhs),
      weekdayDaytimeMean,
      weekdayPeakOccupancy: zMaxWeekdayOccupancy,
    };

    zoneSummaries[zone] = {
      zone,
      site: zReadings[0].site,
      totalKwh: Number(zTotal.toFixed(2)),
      avgKwh: Number(zAvg.toFixed(2)),
      peakKwh: Number(Math.max(...zKwhs).toFixed(2)),
      offHoursKwh: Number(zOffHoursTotal.toFixed(2)),
      minKwh: Number(Math.min(...zKwhs).toFixed(2)),
      maxKwh: Number(Math.max(...zKwhs).toFixed(2)),
      readingsCount: zReadings.length,
      meanOccupancy: zOccupancyCount > 0 ? Number((zOccupancyTotal / zOccupancyCount).toFixed(1)) : 0,
      anomaliesCount: 0,
      totalWasteKwh: 0,
    };
  }

  // 3. Documented Deterministic Anomaly Detection
  const anomalies: AnomalyFinding[] = [];
  let totalWasteKwh = 0;

  for (const r of sortedReadings) {
    const stats = zoneStats[r.zone];
    const date = new Date(r.timestamp);
    const dateIsOffHours = isOffHours(date);
    const dateIsWeekend = isWeekend(date);

    // Rule 1: Off-Hours Unoccupied Waste
    // Triggered when an off-hours reading (10 PM - 6 AM) exceeds 45% of zone daytime mean while building is unoccupied (occ <= 3 or 0)
    if (dateIsOffHours) {
      const isUnoccupied = r.occupancy === undefined || r.occupancy <= 3;
      const offHoursWasteThreshold = stats.daytimeMean * 0.45;

      if (isUnoccupied && r.kwh > offHoursWasteThreshold && r.kwh > stats.offHoursMean * 1.35) {
        const baseline = Math.max(stats.offHoursP25, stats.daytimeMean * 0.18);
        const excess = Math.max(0, r.kwh - baseline);
        const deviationPct = Math.round(((r.kwh - baseline) / baseline) * 100);
        const severity = r.kwh > stats.daytimeMean * 0.7 ? 'high' : 'medium';

        anomalies.push({
          id: `ANO-${r.zone.substring(0, 3).toUpperCase()}-${r.timestamp.replace(/[^0-9]/g, '').slice(4, 12)}-OFF`,
          zone: r.zone,
          site: r.site,
          timestamp: r.timestamp,
          kwh: Number(r.kwh.toFixed(2)),
          baselineKwh: Number(baseline.toFixed(2)),
          excessKwh: Number(excess.toFixed(2)),
          deviationPct,
          rule: 'off_hours_waste',
          ruleLabel: 'Unoccupied Nighttime Basal Waste',
          severity,
          explanation: `Observed ${r.kwh.toFixed(1)} kWh at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} during zero/low occupancy (${r.occupancy ?? 0} occupants). Exceeds off-hours expected baseline (${baseline.toFixed(1)} kWh) by ${deviationPct}%. Indicates unscaled HVAC heating/cooling or unmanaged lighting overnight.`,
          evidence: {
            metric: 'Off-Hours Power Consumption',
            observed: Number(r.kwh.toFixed(2)),
            threshold: Number(offHoursWasteThreshold.toFixed(2)),
            unit: 'kWh',
            occupancy: r.occupancy ?? 0,
            isOffHours: true,
            isWeekend: dateIsWeekend,
          },
        });
        totalWasteKwh += excess;
        zoneSummaries[r.zone].totalWasteKwh += excess;
        zoneSummaries[r.zone].anomaliesCount++;
        continue; // Do not double-count same reading under multiple rules
      }
    }

    // Rule 2: Statistical Spike Anomaly
    // Triggered when reading exceeds Zone Mean + 2.5 * Standard Deviation (rigorous statistical outlier)
    const spikeThreshold = stats.mean + 2.5 * stats.stdDev;
    if (stats.stdDev > 0 && r.kwh > spikeThreshold) {
      const baseline = stats.mean + 1.0 * stats.stdDev;
      const excess = Math.max(0, r.kwh - baseline);
      const deviationPct = Math.round(((r.kwh - stats.mean) / stats.mean) * 100);
      const severity = r.kwh > stats.mean + 3.5 * stats.stdDev ? 'high' : 'medium';

      anomalies.push({
        id: `ANO-${r.zone.substring(0, 3).toUpperCase()}-${r.timestamp.replace(/[^0-9]/g, '').slice(4, 12)}-SPK`,
        zone: r.zone,
        site: r.site,
        timestamp: r.timestamp,
        kwh: Number(r.kwh.toFixed(2)),
        baselineKwh: Number(baseline.toFixed(2)),
        excessKwh: Number(excess.toFixed(2)),
        deviationPct,
        rule: 'statistical_spike',
        ruleLabel: 'Statistical Peak Surge',
        severity,
        explanation: `Consumption spiked to ${r.kwh.toFixed(1)} kWh, exceeding the 2.5σ upper statistical boundary of ${spikeThreshold.toFixed(1)} kWh (zone mean: ${stats.mean.toFixed(1)} kWh, σ: ${stats.stdDev.toFixed(1)}). Consistent with simultaneous chiller compressor staging or mechanical equipment malfunction.`,
        evidence: {
          metric: 'Statistical 2.5σ Threshold',
          observed: Number(r.kwh.toFixed(2)),
          threshold: Number(spikeThreshold.toFixed(2)),
          unit: 'kWh',
          occupancy: r.occupancy,
          isOffHours: dateIsOffHours,
          isWeekend: dateIsWeekend,
        },
      });
      totalWasteKwh += excess;
      zoneSummaries[r.zone].totalWasteKwh += excess;
      zoneSummaries[r.zone].anomaliesCount++;
      continue;
    }

    // Rule 3: Weekend Ghost Load
    // Triggered on Saturday/Sunday daytime when consumption remains > 60% of weekday daytime mean despite negligible occupancy
    if (dateIsWeekend && !dateIsOffHours) {
      const isNegligibleOccupancy =
        r.occupancy === undefined ||
        (stats.weekdayPeakOccupancy > 0 && r.occupancy <= stats.weekdayPeakOccupancy * 0.12) ||
        r.occupancy <= 8;
      const weekendWasteThreshold = stats.weekdayDaytimeMean * 0.60;

      if (isNegligibleOccupancy && r.kwh > weekendWasteThreshold) {
        const baseline = stats.weekdayDaytimeMean * 0.30;
        const excess = Math.max(0, r.kwh - baseline);
        const deviationPct = Math.round(((r.kwh - baseline) / baseline) * 100);

        anomalies.push({
          id: `ANO-${r.zone.substring(0, 3).toUpperCase()}-${r.timestamp.replace(/[^0-9]/g, '').slice(4, 12)}-WKD`,
          zone: r.zone,
          site: r.site,
          timestamp: r.timestamp,
          kwh: Number(r.kwh.toFixed(2)),
          baselineKwh: Number(baseline.toFixed(2)),
          excessKwh: Number(excess.toFixed(2)),
          deviationPct,
          rule: 'weekend_ghost_load',
          ruleLabel: 'Unoccupied Weekend Ghost Load',
          severity: deviationPct > 120 ? 'high' : 'medium',
          explanation: `Weekend consumption remained elevated at ${r.kwh.toFixed(1)} kWh while facility was nearly empty (${r.occupancy ?? 0} occupants vs weekday peak ${stats.weekdayPeakOccupancy}). Exceeds idle weekend baseline of ${baseline.toFixed(1)} kWh by ${deviationPct}%.`,
          evidence: {
            metric: 'Weekend Daytime Threshold',
            observed: Number(r.kwh.toFixed(2)),
            threshold: Number(weekendWasteThreshold.toFixed(2)),
            unit: 'kWh',
            occupancy: r.occupancy ?? 0,
            isOffHours: false,
            isWeekend: true,
          },
        });
        totalWasteKwh += excess;
        zoneSummaries[r.zone].totalWasteKwh += excess;
        zoneSummaries[r.zone].anomaliesCount++;
      }
    }
  }

  // Round summary metrics
  for (const z of Object.values(zoneSummaries)) {
    z.totalWasteKwh = Number(z.totalWasteKwh.toFixed(2));
  }

  const firstDate = new Date(sortedReadings[0].timestamp);
  const lastDate = new Date(sortedReadings[sortedReadings.length - 1].timestamp);
  const durationHours = Math.max(1, Math.round((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60)));
  const daysCount = Math.max(1, Number((durationHours / 24).toFixed(1)));

  const processingDuration = Math.round(performance.now() - startTime);

  return {
    totalKwh: Number(totalKwh.toFixed(2)),
    avgKwh: Number(avgKwh.toFixed(2)),
    medianKwh: Number(medianKwh.toFixed(2)),
    minKwh: Number(minKwh.toFixed(2)),
    maxKwh: Number(maxKwh.toFixed(2)),
    readingsCount: sortedReadings.length,
    zoneCount: zones.length,
    siteCount: sites.length,
    zones,
    sites,
    zoneSummaries,
    anomalies,
    totalWasteKwh: Number(totalWasteKwh.toFixed(2)),
    timeWindow: {
      start: sortedReadings[0].timestamp,
      end: sortedReadings[sortedReadings.length - 1].timestamp,
      durationHours,
      daysCount,
    },
    peakHoursKwh: Number(peakHoursKwh.toFixed(2)),
    offHoursKwh: Number(offHoursKwh.toFixed(2)),
    weekendKwh: Number(weekendKwh.toFixed(2)),
    weekdayKwh: Number(weekdayKwh.toFixed(2)),
    isDemoData,
    clientProcessingDurationMs: processingDuration,
  };
}
