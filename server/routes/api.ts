import { Router, Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { defaultGeminiModel, isGeminiConfigured } from '../geminiClient';
import { runAgentOptimizationWorkflow } from '../services/agentWorkflow';
import { generateDemoCampusReadings } from '../../src/data/demoDataset';
import { generateSampleCsvTemplate } from '../../src/utils/csvParser';

export const apiRouter = Router();

// Rate limiter for AI optimization endpoint: 30 requests per 15 minutes
const agentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    error: 'Rate limit exceeded: Too many AI optimization requests. Please try again in a few minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Zod schema for optimization request payload
const OptimizeRequestSchema = z.object({
  analytics: z.object({
    totalKwh: z.number().nonnegative(),
    avgKwh: z.number().nonnegative(),
    medianKwh: z.number().nonnegative(),
    readingsCount: z.number().positive(),
    zoneCount: z.number().positive(),
    zones: z.array(z.string()).min(1),
    sites: z.array(z.string()).default([]),
    zoneSummaries: z.record(z.any()),
    anomalies: z.array(
      z.object({
        id: z.string(),
        zone: z.string(),
        site: z.string(),
        timestamp: z.string(),
        kwh: z.number(),
        baselineKwh: z.number(),
        excessKwh: z.number(),
        deviationPct: z.number(),
        rule: z.string(),
        ruleLabel: z.string(),
        severity: z.enum(['high', 'medium', 'low']),
        explanation: z.string(),
        evidence: z.any(),
      })
    ),
    totalWasteKwh: z.number().nonnegative(),
    timeWindow: z.object({
      start: z.string(),
      end: z.string(),
      durationHours: z.number(),
      daysCount: z.number(),
    }),
    peakHoursKwh: z.number().nonnegative(),
    offHoursKwh: z.number().nonnegative(),
    weekendKwh: z.number().nonnegative(),
    weekdayKwh: z.number().nonnegative(),
    isDemoData: z.boolean().default(false),
    clientProcessingDurationMs: z.number().nonnegative(),
  }),
  objective: z.string().optional().default('Maximize Energy Conservation'),
  tariff: z.number().min(0.01).max(10).optional().default(0.20),
  locale: z.enum(['en', 'hi', 'mr']).optional().default('en'),
});

/**
 * Health check endpoint
 */
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'WattWise AI Optimization API',
    model: defaultGeminiModel,
    isGeminiConfigured,
    systemTime: new Date().toISOString(),
  });
});

/**
 * AI Agent Optimization Endpoint
 */
apiRouter.post('/agent/optimize', agentLimiter, async (req: Request, res: Response) => {
  try {
    const parseResult = OptimizeRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        error: 'Invalid request payload format',
        details: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const { analytics, objective, tariff, locale } = parseResult.data;

    // Trigger bounded agent workflow
    // @ts-expect-error type alignment
    const plan = await runAgentOptimizationWorkflow(analytics, objective, tariff, locale);

    res.json({
      success: true,
      data: plan,
    });
  } catch (err: any) {
    console.error('API Optimization Error:', err.message || err);
    res.status(500).json({
      success: false,
      error: 'An internal error occurred while executing the AI agent. Safe fallback available.',
    });
  }
});

/**
 * Built-in demo readings endpoint
 */
apiRouter.get('/demo-data', (_req: Request, res: Response) => {
  try {
    const demoReadings = generateDemoCampusReadings();
    res.json({
      success: true,
      isDemo: true,
      count: demoReadings.length,
      data: demoReadings,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Could not load demo dataset' });
  }
});

/**
 * CSV template download endpoint
 */
apiRouter.get('/csv-template', (_req: Request, res: Response) => {
  const csv = generateSampleCsvTemplate();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="wattwise-sample-template.csv"');
  res.send(csv);
});
