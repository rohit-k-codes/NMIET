import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Flame,
  Moon,
  TrendingUp,
  Building,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AnomalyFinding, AnomalyRule } from '../../types/energy';

export const DataAnalysisTab: React.FC = () => {
  const {
    analytics,
    setActiveTab,
    runAiOptimizer,
    isOptimizing,
    t,
    formatNum,
    formatKwhNum,
    formatPercentNum,
    formatDateStr,
  } = useApp();

  const [severityFilter, setSeverityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [ruleFilter, setRuleFilter] = useState<string>('all');
  const [zoneFilter, setZoneFilter] = useState<string>('all');

  const filteredAnomalies = useMemo(() => {
    if (!analytics) return [];
    return analytics.anomalies.filter((a) => {
      const matchSeverity = severityFilter === 'all' || a.severity === severityFilter;
      const matchRule = ruleFilter === 'all' || a.rule === ruleFilter;
      const matchZone = zoneFilter === 'all' || a.zone === zoneFilter;
      return matchSeverity && matchRule && matchZone;
    });
  }, [analytics, severityFilter, ruleFilter, zoneFilter]);

  if (!analytics) return null;

  const getSeverityBadge = (sev: AnomalyFinding['severity']) => {
    switch (sev) {
      case 'high':
        return 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30';
      case 'medium':
        return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
      default:
        return 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30';
    }
  };

  const getRuleIcon = (rule: AnomalyRule) => {
    switch (rule) {
      case 'off_hours_waste':
        return <Moon className="h-3.5 w-3.5 text-cyan-500" />;
      case 'statistical_spike':
        return <Flame className="h-3.5 w-3.5 text-rose-500" />;
      case 'weekend_ghost_load':
        return <Calendar className="h-3.5 w-3.5 text-amber-500" />;
      default:
        return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400" />
            <span>{t('analysis_title')}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('analysis_subtitle')}
          </p>
        </div>

        <button
          onClick={() => {
            setActiveTab('ai-agent');
            runAiOptimizer('Target Identified Nighttime and Weekend Waste');
          }}
          disabled={isOptimizing}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors disabled:opacity-50"
        >
          <span>{t('btn_run_agent_quick')}</span>
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl glass-panel flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center flex-wrap gap-2">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium mr-1">
            <Filter className="h-3.5 w-3.5" />
            Filter by:
          </span>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-400"
          >
            <option value="all">{t('analysis_filter_severity')}</option>
            <option value="high">{t('severity_high')}</option>
            <option value="medium">{t('severity_medium')}</option>
            <option value="low">{t('severity_low')}</option>
          </select>

          {/* Zone Filter */}
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-400"
          >
            <option value="all">{t('analysis_filter_all_zones')}</option>
            {analytics.zones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>

          {/* Rule Filter */}
          <select
            value={ruleFilter}
            onChange={(e) => setRuleFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-400"
          >
            <option value="all">All Anomaly Rules</option>
            <option value="off_hours_waste">Off-Hours Waste</option>
            <option value="statistical_spike">Statistical Spike</option>
            <option value="weekend_ghost_load">Weekend Ghost Load</option>
            <option value="basal_load_drift">Basal Load Drift</option>
          </select>
        </div>

        <span className="text-xs font-mono text-slate-500">
          Showing {formatNum(filteredAnomalies.length)} of {formatNum(analytics.anomalies.length)} findings
        </span>
      </div>

      {/* Findings Table */}
      <div className="rounded-2xl glass-panel overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">{t('analysis_col_id')}</th>
                <th className="px-4 py-3">{t('analysis_col_zone')}</th>
                <th className="px-4 py-3">{t('analysis_col_timestamp')}</th>
                <th className="px-4 py-3">{t('analysis_col_measured')}</th>
                <th className="px-4 py-3">{t('analysis_col_baseline')}</th>
                <th className="px-4 py-3">{t('analysis_col_excess')}</th>
                <th className="px-4 py-3">{t('analysis_col_deviation')}</th>
                <th className="px-4 py-3">{t('analysis_col_severity')}</th>
                <th className="px-4 py-3">{t('analysis_col_explanation')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300 font-mono">
              {filteredAnomalies.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                    {a.id}
                  </td>
                  <td className="px-4 py-3 font-sans font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {a.zone}
                  </td>
                  <td className="px-4 py-3 font-sans text-slate-500 whitespace-nowrap">
                    {formatDateStr(a.timestamp)}
                  </td>
                  <td className="px-4 py-3 text-slate-900 dark:text-slate-100">
                    {formatNum(a.kwh, 1, 1)}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {formatNum(a.baselineKwh, 1, 1)}
                  </td>
                  <td className="px-4 py-3 font-bold text-rose-600 dark:text-rose-400">
                    +{formatNum(a.excessKwh, 1, 1)}
                  </td>
                  <td className="px-4 py-3 font-bold text-amber-600 dark:text-amber-400">
                    +{formatPercentNum(a.deviationPct, 0)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${getSeverityBadge(
                        a.severity
                      )}`}
                    >
                      {t(`severity_${a.severity}` as any)}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-sans text-slate-600 dark:text-slate-300 max-w-xs leading-relaxed">
                    <div className="flex items-center gap-1.5 font-semibold text-[11px] text-slate-800 dark:text-slate-200 mb-0.5">
                      {getRuleIcon(a.rule)}
                      <span>{a.ruleLabel}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {a.explanation}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
