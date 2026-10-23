import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  EnergyReading,
  DatasetAnalytics,
  AgentOptimizationPlan,
  ActionTask,
  SavingsScenario,
  SavingsResult,
  SystemDiagnostics,
  SessionAuditEntry,
} from '../types/energy';
import { calculateDatasetAnalytics } from '../utils/analytics';
import { parseAndValidateCsv, sanitizeCsvExportField, CsvValidationError } from '../utils/csvParser';
import { calculateSavingsScenario } from '../utils/savingsCalculator';
import { generateDemoCampusReadings } from '../data/demoDataset';
import { Language, TranslationKey } from '../i18n/types';
import { translations } from '../i18n/translations';
import {
  formatNumber,
  formatKwh,
  formatCurrency,
  formatPercent,
  formatDateTime,
  formatTime,
} from '../i18n/formatters';

export type TabType =
  | 'overview'
  | 'data-import'
  | 'data-analysis'
  | 'ai-agent'
  | 'action-center'
  | 'savings-calculator'
  | 'settings'
  | 'system-diagnostics';

export type ThemeMode = 'dark' | 'light' | 'system';

interface AppContextType {
  // Navigation & Tabs
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;

  // Theme Management
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Localization
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  formatNum: (val: number, minDec?: number, maxDec?: number) => string;
  formatKwhNum: (val: number, dec?: number) => string;
  formatMoney: (val: number, dec?: number) => string;
  formatPercentNum: (val: number, dec?: number) => string;
  formatDateStr: (date: string | number | Date) => string;
  formatTimeStr: (date: string | number | Date) => string;

  // Data & Analytics State
  readings: EnergyReading[];
  analytics: DatasetAnalytics | null;
  isDemoData: boolean;
  csvValidationErrors: CsvValidationError[];
  csvWarnings: string[];

  // AI & Action Tasks
  optimizationPlan: AgentOptimizationPlan | null;
  actionTasks: ActionTask[];
  savingsScenario: SavingsScenario;
  setSavingsScenario: React.Dispatch<React.SetStateAction<SavingsScenario>>;
  savingsResult: SavingsResult | null;

  // System & Diagnostics
  diagnostics: SystemDiagnostics;
  sessionAudit: SessionAuditEntry[];
  isAnalyzing: boolean;
  isOptimizing: boolean;
  apiHealth: { status: string; isGeminiConfigured: boolean; model: string } | null;

  // Actions
  loadDemoData: () => void;
  clearSessionData: () => void;
  handleCsvUpload: (csvText: string, filename: string) => boolean;
  runAiOptimizer: (objective?: string) => Promise<void>;
  approveAction: (taskId: string, note?: string) => void;
  dismissAction: (taskId: string, note?: string) => void;
  exportReportJson: () => void;
  exportFindingsCsv: () => void;
  exportActionsCsv: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'wattwise_theme';
const LANG_STORAGE_KEY = 'wattwise_language';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Theme setup: initialize from localStorage or system default
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode;
      if (saved === 'dark' || saved === 'light' || saved === 'system') {
        return saved;
      }
    } catch {}
    return 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');

  // Synchronize effective theme and class on document.documentElement
  useEffect(() => {
    const applyTheme = () => {
      let isDark = true;
      if (themeMode === 'system') {
        isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        isDark = themeMode === 'dark';
      }

      setResolvedTheme(isDark ? 'dark' : 'light');

      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();

    if (themeMode === 'system' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [themeMode]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {}
  };

  const toggleTheme = () => {
    const nextMode: ThemeMode = resolvedTheme === 'dark' ? 'light' : 'dark';
    setThemeMode(nextMode);
  };

  // Language setup: initialize from localStorage or default 'en'
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY) as Language;
      if (saved === 'en' || saved === 'hi' || saved === 'mr') {
        return saved;
      }
    } catch {}
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {}
  };

  // Translation helper
  const t = (key: TranslationKey, vars?: Record<string, string | number>): string => {
    const langDict = translations[language] || translations.en;
    let text = langDict[key] || translations.en[key] || key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return text;
  };

  // Formatting helpers
  const formatNum = (val: number, minDec = 0, maxDec = 2) => formatNumber(val, language, minDec, maxDec);
  const formatKwhNum = (val: number, dec = 1) => formatKwh(val, language, dec);
  const formatMoney = (val: number, dec = 2) => formatCurrency(val, language, dec);
  const formatPercentNum = (val: number, dec = 0) => formatPercent(val, language, dec);
  const formatDateStr = (date: string | number | Date) => formatDateTime(date, language);
  const formatTimeStr = (date: string | number | Date) => formatTime(date, language);

  // In-memory data states (strictly zero database persistence)
  const [readings, setReadings] = useState<EnergyReading[]>([]);
  const [analytics, setAnalytics] = useState<DatasetAnalytics | null>(null);
  const [isDemoData, setIsDemoData] = useState<boolean>(true);
  const [csvValidationErrors, setCsvValidationErrors] = useState<CsvValidationError[]>([]);
  const [csvWarnings, setCsvWarnings] = useState<string[]>([]);

  const [optimizationPlan, setOptimizationPlan] = useState<AgentOptimizationPlan | null>(null);
  const [actionTasks, setActionTasks] = useState<ActionTask[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [apiHealth, setApiHealth] = useState<{ status: string; isGeminiConfigured: boolean; model: string } | null>(null);

  const [savingsScenario, setSavingsScenario] = useState<SavingsScenario>({
    targetReductionPct: 15,
    electricityTariff: 0.20,
    targetZone: 'all',
  });

  const [diagnostics, setDiagnostics] = useState<SystemDiagnostics>({
    csvRowsProcessed: 0,
    clientAnalyticsDurationMs: 0,
    backendLatencyMs: 0,
    aiRequestsCount: 0,
    toolInvocationsCount: 0,
    validationErrorsCount: 0,
    isFallbackMode: true,
    lastRunTimestamp: new Date().toISOString(),
    sessionAuditCount: 0,
  });

  const [sessionAudit, setSessionAudit] = useState<SessionAuditEntry[]>([]);

  const logAuditEvent = (type: SessionAuditEntry['type'], description: string, details?: Record<string, unknown>) => {
    const entry: SessionAuditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      type,
      description,
      details,
    };
    setSessionAudit((prev) => [entry, ...prev].slice(0, 100));
    setDiagnostics((prev) => ({
      ...prev,
      sessionAuditCount: prev.sessionAuditCount + 1,
    }));
  };

  // Fetch backend health status on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setApiHealth(data);
        setDiagnostics((prev) => ({
          ...prev,
          isFallbackMode: !data.isGeminiConfigured,
        }));
      })
      .catch(() => {
        setApiHealth({ status: 'offline', isGeminiConfigured: false, model: 'gemini-3.8-flash' });
      });
  }, []);

  // Built-in Demo Data Loader
  const loadDemoData = () => {
    setIsAnalyzing(true);
    try {
      const demoReadings = generateDemoCampusReadings();
      const demoAnalytics = calculateDatasetAnalytics(demoReadings, true);

      setReadings(demoReadings);
      setAnalytics(demoAnalytics);
      setIsDemoData(true);
      setCsvValidationErrors([]);
      setCsvWarnings([]);

      setDiagnostics((prev) => ({
        ...prev,
        csvRowsProcessed: demoReadings.length,
        clientAnalyticsDurationMs: demoAnalytics.clientProcessingDurationMs,
        lastRunTimestamp: new Date().toISOString(),
      }));

      logAuditEvent('DATA_IMPORT', 'Loaded 7-day realistic campus demo dataset (840 hourly observations, 5 zones).', {
        readingsCount: demoReadings.length,
        zones: demoAnalytics.zones,
        totalKwh: demoAnalytics.totalKwh,
        anomaliesCount: demoAnalytics.anomalies.length,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Clear current session data completely
  const clearSessionData = () => {
    setReadings([]);
    setAnalytics(null);
    setIsDemoData(false);
    setOptimizationPlan(null);
    setActionTasks([]);
    setCsvValidationErrors([]);
    setCsvWarnings([]);
    logAuditEvent('DATA_IMPORT', 'Cleared current session telemetry and action tasks from memory.');
  };

  // Auto-load demo dataset on mount
  useEffect(() => {
    loadDemoData();
  }, []);

  // Handle User CSV Upload
  const handleCsvUpload = (csvText: string, filename: string): boolean => {
    setIsAnalyzing(true);
    setCsvValidationErrors([]);
    setCsvWarnings([]);

    try {
      const parsed = parseAndValidateCsv(csvText);

      if (!parsed.success || parsed.errors.length > 0) {
        setCsvValidationErrors(parsed.errors);
        setCsvWarnings(parsed.warnings);
        setDiagnostics((prev) => ({
          ...prev,
          validationErrorsCount: prev.validationErrorsCount + parsed.errors.length,
        }));
        logAuditEvent('DATA_IMPORT', `CSV validation failed for "${filename}" with ${parsed.errors.length} errors.`, {
          errors: parsed.errors.slice(0, 5),
        });
        return false;
      }

      const calculatedAnalytics = calculateDatasetAnalytics(parsed.readings, false);

      setReadings(parsed.readings);
      setAnalytics(calculatedAnalytics);
      setIsDemoData(false);
      setCsvValidationErrors([]);
      setCsvWarnings(parsed.warnings);

      setDiagnostics((prev) => ({
        ...prev,
        csvRowsProcessed: parsed.readings.length,
        clientAnalyticsDurationMs: calculatedAnalytics.clientProcessingDurationMs,
        lastRunTimestamp: new Date().toISOString(),
      }));

      logAuditEvent('DATA_IMPORT', `Successfully parsed and analyzed user CSV "${filename}".`, {
        rows: parsed.readings.length,
        zones: calculatedAnalytics.zones,
        totalKwh: calculatedAnalytics.totalKwh,
        anomalies: calculatedAnalytics.anomalies.length,
      });

      return true;
    } catch (err: any) {
      setCsvValidationErrors([
        {
          row: 0,
          field: 'runtime',
          message: err.message || 'An error occurred during dataset computation.',
        },
      ]);
      return false;
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Run AI Optimization Agent with locale support
  const runAiOptimizer = async (objective: string = 'Maximize Energy Conservation') => {
    if (!analytics) return;
    setIsOptimizing(true);
    const startMs = performance.now();

    try {
      logAuditEvent('AGENT_INVOCATION', `Invoking Autonomous Agent for objective: "${objective}" [Locale: ${language}].`, {
        objective,
        tariff: savingsScenario.electricityTariff,
        locale: language,
      });

      const response = await fetch('/api/agent/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analytics,
          objective,
          tariff: savingsScenario.electricityTariff,
          locale: language,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const resJson = await response.json();
      if (!resJson.success || !resJson.data) {
        throw new Error(resJson.error || 'Failed to retrieve agent optimization plan');
      }

      const plan: AgentOptimizationPlan = resJson.data;
      setOptimizationPlan(plan);
      setActionTasks(plan.actions);

      const latency = Math.round(performance.now() - startMs);
      const toolCallsCount = plan.executionLogs.filter((l) => l.type === 'tool_call').length;

      setDiagnostics((prev) => ({
        ...prev,
        backendLatencyMs: latency,
        aiRequestsCount: prev.aiRequestsCount + 1,
        toolInvocationsCount: prev.toolInvocationsCount + toolCallsCount,
        isFallbackMode: plan.usedFallback,
        lastRunTimestamp: new Date().toISOString(),
      }));

      logAuditEvent('AGENT_INVOCATION', `Agent optimization finished in ${latency}ms (${toolCallsCount} tools called).`, {
        actionsCount: plan.actions.length,
        usedFallback: plan.usedFallback,
        modelUsed: plan.modelUsed,
      });

      setActiveTab('ai-agent');
    } catch (err: any) {
      console.error('Agent optimizer invocation failed:', err);
      logAuditEvent('AGENT_INVOCATION', `Agent run encountered error: ${err.message}. Engaging client-side deterministic fallback.`);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Approve Action Task (Human-in-the-Loop)
  const approveAction = (taskId: string, note?: string) => {
    setActionTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: 'approved',
              reviewedAt: new Date().toISOString(),
              reviewDecisionNote: note || 'Approved by facility manager for execution verification.',
            }
          : t
      )
    );
    const task = actionTasks.find((t) => t.id === taskId);
    logAuditEvent('ACTION_APPROVED', `Action task ${taskId} approved by human operator.`, {
      title: task?.title,
      zone: task?.zone,
      estimatedKwhSavings: task?.estimatedKwhReduction,
    });
  };

  // Dismiss Action Task
  const dismissAction = (taskId: string, note?: string) => {
    setActionTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: 'dismissed',
              reviewedAt: new Date().toISOString(),
              reviewDecisionNote: note || 'Dismissed during facilities review.',
            }
          : t
      )
    );
    const task = actionTasks.find((t) => t.id === taskId);
    logAuditEvent('ACTION_DISMISSED', `Action task ${taskId} dismissed.`, {
      title: task?.title,
      zone: task?.zone,
    });
  };

  // Recalculate savings scenario dynamically when inputs change
  const savingsResult = useMemo(() => {
    if (!analytics) return null;
    return calculateSavingsScenario(analytics, savingsScenario);
  }, [analytics, savingsScenario]);

  // Export Full JSON Report
  const exportReportJson = () => {
    if (!analytics) return;
    const reportData = {
      reportTitle: 'WattWise AI - Campus Energy Optimization Report',
      generatedAt: new Date().toISOString(),
      language,
      isDemoData,
      datasetAnalytics: analytics,
      savingsScenario,
      savingsResult,
      optimizationPlan: optimizationPlan
        ? {
            strategySummary: optimizationPlan.strategySummary,
            identifiedWasteSummary: optimizationPlan.identifiedWasteSummary,
            overallConfidence: optimizationPlan.overallConfidence,
            usedFallback: optimizationPlan.usedFallback,
            modelUsed: optimizationPlan.modelUsed,
          }
        : null,
      actionTasks,
      auditTimeline: sessionAudit,
      disclaimer: 'Human-in-the-loop audit report. Approvals and tasks are session records. No external physical campus equipment control.',
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wattwise-energy-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    logAuditEvent('REPORT_EXPORTED', 'Exported comprehensive JSON energy optimization report.');
  };

  // Export Findings CSV with formula injection sanitization
  const exportFindingsCsv = () => {
    if (!analytics) return;
    const headers = ['Anomaly ID', 'Zone', 'Site', 'Timestamp', 'Measured kWh', 'Baseline kWh', 'Excess kWh', 'Deviation %', 'Rule', 'Severity', 'Explanation'];
    const rows = analytics.anomalies.map((a) => [
      sanitizeCsvExportField(a.id),
      sanitizeCsvExportField(a.zone),
      sanitizeCsvExportField(a.site),
      sanitizeCsvExportField(a.timestamp),
      sanitizeCsvExportField(a.kwh),
      sanitizeCsvExportField(a.baselineKwh),
      sanitizeCsvExportField(a.excessKwh),
      sanitizeCsvExportField(a.deviationPct),
      sanitizeCsvExportField(a.rule),
      sanitizeCsvExportField(a.severity),
      sanitizeCsvExportField(a.explanation),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wattwise-findings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    logAuditEvent('REPORT_EXPORTED', 'Exported detected anomaly findings CSV.');
  };

  // Export Action Tasks CSV
  const exportActionsCsv = () => {
    if (actionTasks.length === 0) return;
    const headers = ['Task ID', 'Title', 'Zone', 'Urgency', 'Category', 'Status', 'Implementation Effort', 'Confidence', 'Est kWh Saved', 'Est $ Saved', 'Rationale', 'Created At', 'Reviewed At', 'Review Note'];
    const rows = actionTasks.map((t) => [
      sanitizeCsvExportField(t.id),
      sanitizeCsvExportField(t.title),
      sanitizeCsvExportField(t.zone),
      sanitizeCsvExportField(t.urgency),
      sanitizeCsvExportField(t.category),
      sanitizeCsvExportField(t.status),
      sanitizeCsvExportField(t.implementationEffort),
      sanitizeCsvExportField(t.confidenceScore),
      sanitizeCsvExportField(t.estimatedKwhReduction),
      sanitizeCsvExportField(t.estimatedCostSavings),
      sanitizeCsvExportField(t.rationale),
      sanitizeCsvExportField(t.createdAt),
      sanitizeCsvExportField(t.reviewedAt || ''),
      sanitizeCsvExportField(t.reviewDecisionNote || ''),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wattwise-actions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    logAuditEvent('REPORT_EXPORTED', 'Exported human-in-the-loop action tasks CSV.');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        themeMode,
        setThemeMode,
        theme: resolvedTheme,
        toggleTheme,
        language,
        setLanguage,
        t,
        formatNum,
        formatKwhNum,
        formatMoney,
        formatPercentNum,
        formatDateStr,
        formatTimeStr,
        readings,
        analytics,
        isDemoData,
        csvValidationErrors,
        csvWarnings,
        optimizationPlan,
        actionTasks,
        savingsScenario,
        setSavingsScenario,
        savingsResult,
        diagnostics,
        sessionAudit,
        isAnalyzing,
        isOptimizing,
        apiHealth,
        loadDemoData,
        clearSessionData,
        handleCsvUpload,
        runAiOptimizer,
        approveAction,
        dismissAction,
        exportReportJson,
        exportFindingsCsv,
        exportActionsCsv,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
