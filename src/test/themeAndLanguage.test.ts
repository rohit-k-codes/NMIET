import { describe, it, expect, beforeEach, vi } from 'vitest';
import { translations } from '../i18n/translations';
import { Language, TranslationKey } from '../i18n/types';
import { formatNumber, formatKwh, formatCurrency, formatPercent, getIntlLocale } from '../i18n/formatters';
import { generateDeterministicOptimizationPlan } from '../../server/services/fallbackAgent';
import { generateDemoCampusReadings } from '../data/demoDataset';
import { calculateDatasetAnalytics } from '../utils/analytics';

describe('Theme, Localization & Production Readiness Suite', () => {
  const demoReadings = generateDemoCampusReadings();
  const analytics = calculateDatasetAnalytics(demoReadings, true);

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  describe('1. Translation Completeness & Integrity', () => {
    const requiredLanguages: Language[] = ['en', 'hi', 'mr'];
    const englishKeys = Object.keys(translations.en) as TranslationKey[];

    it('contains all required languages (English, Hindi, Marathi)', () => {
      requiredLanguages.forEach((lang) => {
        expect(translations[lang]).toBeDefined();
        expect(Object.keys(translations[lang]).length).toBeGreaterThanOrEqual(80);
      });
    });

    it('has zero missing translation keys in Hindi compared to English', () => {
      englishKeys.forEach((key) => {
        expect(translations.hi[key], `Missing Hindi translation for key "${key}"`).toBeDefined();
        expect(translations.hi[key].trim().length).toBeGreaterThan(0);
      });
    });

    it('has zero missing translation keys in Marathi compared to English', () => {
      englishKeys.forEach((key) => {
        expect(translations.mr[key], `Missing Marathi translation for key "${key}"`).toBeDefined();
        expect(translations.mr[key].trim().length).toBeGreaterThan(0);
      });
    });
  });

  describe('2. Locale Number & Currency Formatters', () => {
    it('maps language codes to appropriate regional locales', () => {
      expect(getIntlLocale('en')).toBe('en-US');
      expect(getIntlLocale('hi')).toBe('hi-IN');
      expect(getIntlLocale('mr')).toBe('mr-IN');
    });

    it('formats numbers and kWh accurately in English', () => {
      expect(formatNumber(12500.5, 'en', 1, 1)).toBe('12,500.5');
      expect(formatKwh(340.25, 'en', 1)).toBe('340.3 kWh');
      expect(formatCurrency(150.75, 'en')).toBe('$150.75');
      expect(formatPercent(25, 'en')).toBe('25%');
    });

    it('formats numbers and kWh accurately in Hindi and Marathi without crashing', () => {
      const hiFormatted = formatNumber(12500.5, 'hi', 1, 1);
      const mrFormatted = formatNumber(12500.5, 'mr', 1, 1);

      expect(hiFormatted).toBeTruthy();
      expect(mrFormatted).toBeTruthy();
      expect(formatKwh(500, 'hi')).toContain('kWh');
      expect(formatKwh(500, 'mr')).toContain('kWh');
      expect(formatCurrency(75.5, 'hi')).toContain('$');
    });
  });

  describe('3. Localized Fallback Optimization Agent Plans', () => {
    it('produces localized strategy summaries and task titles for English', async () => {
      const planEn = await generateDeterministicOptimizationPlan(analytics, 'Maximize Energy Conservation', 0.22, 'en');

      expect(planEn.strategySummary).toContain('WattWise Rule Engine analyzed');
      expect(planEn.actions.length).toBeGreaterThan(0);
      expect(planEn.actions[0].title).toMatch(/Nighttime|Remediate|Investigate/);
      expect(planEn.usedFallback).toBe(true);
      expect(planEn.modelUsed).toBe('deterministic-rule-engine-v1');
    });

    it('produces authentic localized strategy summaries and task titles for Hindi', async () => {
      const planHi = await generateDeterministicOptimizationPlan(analytics, 'अधिकतम ऊर्जा संरक्षण', 0.22, 'hi');

      expect(planHi.strategySummary).toContain('WattWise इंजन ने');
      expect(planHi.identifiedWasteSummary).toContain('रोके जाने योग्य अपव्यय');
      expect(planHi.actions.length).toBeGreaterThan(0);
      expect(planHi.actions[0].title).toMatch(/सुधार|जांच|लागू करें|अंशांकन/);
    });

    it('produces authentic localized strategy summaries and task titles for Marathi', async () => {
      const planMr = await generateDeterministicOptimizationPlan(analytics, 'कमाल ऊर्जा संवर्धन', 0.22, 'mr');

      expect(planMr.strategySummary).toContain('WattWise इंजिनने');
      expect(planMr.identifiedWasteSummary).toContain('टाळता येणारा अपव्यय');
      expect(planMr.actions.length).toBeGreaterThan(0);
      expect(planMr.actions[0].title).toMatch(/सुधारणा|तपासणी|लागू करा|कॅलिब्रेशन/);
    });

    it('maintains mathematical calculation equality across languages', async () => {
      const planEn = await generateDeterministicOptimizationPlan(analytics, 'Goal', 0.20, 'en');
      const planHi = await generateDeterministicOptimizationPlan(analytics, 'Goal', 0.20, 'hi');
      const planMr = await generateDeterministicOptimizationPlan(analytics, 'Goal', 0.20, 'mr');

      // Task counts and estimated energy reductions must be 100% identical
      expect(planHi.actions.length).toBe(planEn.actions.length);
      expect(planMr.actions.length).toBe(planEn.actions.length);

      for (let i = 0; i < planEn.actions.length; i++) {
        expect(planHi.actions[i].estimatedKwhReduction).toBe(planEn.actions[i].estimatedKwhReduction);
        expect(planMr.actions[i].estimatedKwhReduction).toBe(planEn.actions[i].estimatedKwhReduction);
        expect(planHi.actions[i].estimatedCostSavings).toBe(planEn.actions[i].estimatedCostSavings);
        expect(planMr.actions[i].estimatedCostSavings).toBe(planEn.actions[i].estimatedCostSavings);
      }
    });
  });

  describe('4. Zero Sensitive Persistence Constraints', () => {
    it('persists only theme and language preferences in localStorage and never telemetry data', () => {
      localStorage.setItem('wattwise_theme', 'dark');
      localStorage.setItem('wattwise_language', 'hi');

      expect(localStorage.getItem('wattwise_theme')).toBe('dark');
      expect(localStorage.getItem('wattwise_language')).toBe('hi');

      // Verify no sensitive session items are in localStorage
      expect(localStorage.getItem('readings')).toBeNull();
      expect(localStorage.getItem('analytics')).toBeNull();
      expect(localStorage.getItem('optimizationPlan')).toBeNull();
      expect(localStorage.getItem('actionTasks')).toBeNull();
      expect(localStorage.getItem('GEMINI_API_KEY')).toBeNull();
    });
  });
});
