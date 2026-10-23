import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { calculateDatasetAnalytics } from '../utils/analytics';
import { generateDemoCampusReadings } from '../data/demoDataset';

// Mock geminiClient with a realistic multi-turn function calling response sequence
vi.mock('../../server/geminiClient', () => {
  let callCount = 0;
  return {
    defaultGeminiModel: 'gemini-3.8-flash',
    isGeminiConfigured: true,
    geminiClient: {
      models: {
        generateContent: vi.fn(async () => {
          callCount++;
          if (callCount === 1) {
            // First turn: model calls inspect_energy_data
            return {
              candidates: [
                {
                  content: {
                    parts: [
                      {
                        functionCall: {
                          name: 'inspect_energy_data',
                          args: { zone: 'Campus Library', time_window: 'all', anomaly_type: 'all' },
                        },
                      },
                    ],
                  },
                },
              ],
            };
          } else if (callCount === 2) {
            // Second turn: model calls draft_maintenance_task
            return {
              candidates: [
                {
                  content: {
                    parts: [
                      {
                        functionCall: {
                          name: 'draft_maintenance_task',
                          args: {
                            finding_id: 'ANO-MOCK-1',
                            zone: 'Campus Library',
                            title: 'Adjust Nighttime Thermostat Schedule',
                            urgency: 'high',
                            category: 'hvac_scheduling',
                            recommended_steps: ['Reset BAS setback', 'Verify damper shutoff'],
                            estimated_kwh_reduction: 45.0,
                            implementation_effort: 'low',
                            confidence_score: 0.95,
                            rationale: 'Elevated off-hours consumption during zero occupancy interval',
                          },
                        },
                      },
                    ],
                  },
                },
              ],
            };
          } else {
            // Final turn: model provides final synthesis
            return {
              candidates: [
                {
                  content: {
                    parts: [
                      {
                        text: JSON.stringify({
                          strategySummary: 'Successfully analyzed campus data and created targeted actions.',
                          identifiedWasteSummary: 'Detected significant off-hours HVAC waste in Library.',
                          overallConfidence: 0.95,
                          missingDataWarnings: ['Submeter granularity is building-level.'],
                        }),
                      },
                    ],
                  },
                },
              ],
            };
          }
        }),
      },
    },
  };
});

import app from '../../server/index';

describe('Backend Express API Suite', () => {
  it('GET /api/health returns healthy status and model information', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.model).toBeDefined();
    expect(typeof res.body.isGeminiConfigured).toBe('boolean');
  });

  it('GET /api/demo-data returns 840 campus readings', async () => {
    const res = await request(app).get('/api/demo-data');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(840);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/csv-template returns CSV content with appropriate headers', async () => {
    const res = await request(app).get('/api/csv-template');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain('timestamp,site,zone,kwh,occupancy');
  });

  it('POST /api/agent/optimize rejects malformed or incomplete payload with HTTP 400', async () => {
    const res = await request(app)
      .post('/api/agent/optimize')
      .send({ invalid: 'payload' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Invalid request payload format');
  });

  it('POST /api/agent/optimize processes valid analytics and executes tool calling loop', async () => {
    const readings = generateDemoCampusReadings();
    const analytics = calculateDatasetAnalytics(readings, true);

    const res = await request(app)
      .post('/api/agent/optimize')
      .send({
        analytics,
        objective: 'Focus on Nighttime Basal Waste',
        tariff: 0.22,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.actions.length).toBeGreaterThan(0);
    expect(Array.isArray(res.body.data.executionLogs)).toBe(true);
    // Verifies that inspect_energy_data and draft_maintenance_task tools were recorded in executionLogs
    expect(res.body.data.executionLogs.some((l: any) => l.toolName === 'inspect_energy_data')).toBe(true);
    expect(res.body.data.executionLogs.some((l: any) => l.toolName === 'draft_maintenance_task')).toBe(true);
  });

  it('POST /api/agent/optimize accepts and processes locale preference parameter', async () => {
    const readings = generateDemoCampusReadings();
    const analytics = calculateDatasetAnalytics(readings, true);

    const res = await request(app)
      .post('/api/agent/optimize')
      .send({
        analytics,
        objective: 'कमाल ऊर्जा संवर्धन',
        tariff: 0.20,
        locale: 'mr',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });
});
