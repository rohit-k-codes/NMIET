import { EnergyReading } from '../types/energy';

/**
 * Built-in Campus Energy Demo Dataset
 * Realistic 7-day hourly energy profiles for 5 representative campus facilities:
 * 1. Engineering Hall (HVAC & Research Labs)
 * 2. Campus Library (Circulation, Study Pods, Stack Lighting)
 * 3. Science Complex (Cleanrooms, Ultra-low Freezers, Fume Hoods)
 * 4. Athletic Center (Fieldhouse, Arena Lighting, Pool Pumps)
 * 5. Student Center & Dining (Commercial Kitchens, Refrigeration, Common Areas)
 */
export function generateDemoCampusReadings(): EnergyReading[] {
  const readings: EnergyReading[] = [];
  const baseDate = new Date('2026-10-12T00:00:00Z'); // Monday 00:00 UTC
  const site = 'University Central Campus';

  const zonesConfig = [
    {
      name: 'Engineering Hall',
      baseOffHours: 22,
      peakDaytime: 68,
      peakOccupancy: 180,
      noise: 3.5,
    },
    {
      name: 'Campus Library',
      baseOffHours: 12,
      peakDaytime: 46,
      peakOccupancy: 240,
      noise: 2.2,
    },
    {
      name: 'Science Complex',
      baseOffHours: 48, // continuous lab equipment
      peakDaytime: 94,
      peakOccupancy: 110,
      noise: 4.0,
    },
    {
      name: 'Athletic Center',
      baseOffHours: 15,
      peakDaytime: 58,
      peakOccupancy: 150,
      noise: 3.0,
    },
    {
      name: 'Student Center & Dining',
      baseOffHours: 18,
      peakDaytime: 55,
      peakOccupancy: 220,
      noise: 2.8,
    },
  ];

  // 7 days = 168 hours
  for (let hourIdx = 0; hourIdx < 168; hourIdx++) {
    const currentDate = new Date(baseDate.getTime() + hourIdx * 60 * 60 * 1000);
    const dayOfWeek = currentDate.getUTCDay(); // 0 is Sunday, 6 is Saturday
    const hourOfDay = currentDate.getUTCHours();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    for (const z of zonesConfig) {
      let kwh = 0;
      let occupancy = 0;

      // Base diurnal curve
      if (hourOfDay >= 7 && hourOfDay <= 18) {
        // Daytime
        const progress = (hourOfDay - 7) / 11;
        const bellCurve = Math.sin(progress * Math.PI);
        const dayScale = isWeekend ? 0.35 : 1.0;

        kwh = z.baseOffHours + (z.peakDaytime - z.baseOffHours) * bellCurve * dayScale;
        occupancy = Math.round(z.peakOccupancy * bellCurve * (isWeekend ? 0.15 : 1.0));
      } else if (hourOfDay > 18 && hourOfDay < 22) {
        // Evening wind-down
        const eveningScale = (22 - hourOfDay) / 4;
        kwh = z.baseOffHours + (z.peakDaytime * 0.45 - z.baseOffHours) * eveningScale;
        occupancy = Math.round(z.peakOccupancy * 0.25 * eveningScale);
      } else {
        // Deep Night (22:00 - 06:00)
        kwh = z.baseOffHours;
        occupancy = 0;
      }

      // Add pseudo-random deterministic variation based on hourIdx
      const pseudoRandom = Math.sin(hourIdx * 17 + z.name.length) * z.noise;
      kwh = Math.max(5, kwh + pseudoRandom);

      // --- INJECT REALISTIC ANOMALY SIGNATURES FOR DEMO ---

      // Anomaly 1: Library HVAC left on manual full override Wednesday night (hourIdx 50 - 54, ~02:00-06:00)
      if (z.name === 'Campus Library' && hourIdx >= 50 && hourIdx <= 53) {
        kwh = 42.5 + Math.sin(hourIdx) * 2; // Near daytime peak at 3 AM!
        occupancy = 0;
      }

      // Anomaly 2: Engineering Hall mechanical chiller surge (hourIdx 90, Thursday 18:00)
      if (z.name === 'Engineering Hall' && hourIdx === 90) {
        kwh = 118.4; // 2.5x standard deviation spike
        occupancy = 45;
      }

      // Anomaly 3: Athletic Center fieldhouse & arena floodlights left ON Sunday overnight (hourIdx 146 - 150)
      if (z.name === 'Athletic Center' && hourIdx >= 146 && hourIdx <= 149) {
        kwh = 48.2 + Math.cos(hourIdx) * 1.5; // High off-hours draw
        occupancy = 0;
      }

      // Anomaly 4: Student Center Walk-In Freezer Defrost failure causing high weekend daytime baseline (Saturday hourIdx 125-132)
      if (z.name === 'Student Center & Dining' && hourIdx >= 125 && hourIdx <= 130) {
        kwh = 49.5 + Math.sin(hourIdx) * 1.8;
        occupancy = 4; // empty on Saturday morning yet high power
      }

      readings.push({
        timestamp: currentDate.toISOString(),
        site,
        zone: z.name,
        kwh: Number(kwh.toFixed(2)),
        occupancy,
      });
    }
  }

  return readings;
}
