import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Flame,
  Moon,
  TrendingUp,
  Filter,
  Calendar,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AnomalyFinding, AnomalyRule } from '../../types/energy';
import { SeverityLevel, getSeverityTranslationKey } from '../../i18n/types';

export const DataAnalysisTab: React.FC = () => {
  const {
    analytics,
    setActiveTab,
    runAiOptimizer,
    isOptimizing,
    t,
    formatNum,
    formatPercentNum,
    formatDateStr,
  } = useApp();

  const [severityFilter, setSeverityFilter] = useState<'all' | SeverityLevel>('all');
  const [ruleFilter, setRuleFilter] = useState<string>('all');
  const [zoneFilter, setZoneFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 25;

  const filteredAnomalies = useMemo(() => {
    if (!analytics) return [];
    return analytics.anomalies.filter((a) => {
      const matchSeverity = severityFilter === 'all' || a.severity === severityFilter;
      const matchRule = ruleFilter === 'all' || a.rule === ruleFilter;
      const matchZone = zoneFilter === 'all' || a.zone === zoneFilter;
      return matchSeverity && matchRule && matchZone;
    });
  }, [analytics, severityFilter, ruleFilter, zoneFilter]);

  // Reset to first page on filter change
  useMemo(() => {
    setCurrentPage(1);
  }, [severityFilter, ruleFilter, zoneFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAnomalies.length / pageSize));
  const paginatedAnomalies = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAnomalies.slice(start, start + pageSize);
  }, [filteredAnomalies, currentPage, pageSize]);

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
        return <Moon className="h-3.5 w-3.5 text-cyan-500" aria-hidden="true" />;
      case 'statistical_spike':
        return <Flame className="h-3.5 w-3.5 text-rose-500" aria-hidden="true" />;
      case 'weekend_ghost_load':
        return <Calendar className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />;
      default:
        return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400" aria-hidden="true" />
            <span>{t('analysis_title')}</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            {t('analysis_subtitle')}
          </p>
        </div>

        <button
          onClick={() => {
            setActiveTab('ai-agent');
            runAiOptimizer('Target Identified Nighttime and Weekend Waste');
          }}
          disabled={isOptimizing}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          <span>{t('btn_run_agent_quick')}</span>
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl glass-panel flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center flex-wrap gap-2">
          <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-medium mr-1">
            <Filter className="h-3.5 w-3.5" aria-hidden="true" />
            Filter by:
          </span>

          {/* Severity Filter */}
          <label htmlFor="severity-filter" className="sr-only">
            {t('analysis_filter_severity')}
          </label>
          <select
            id="severity-filter"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as 'all' | SeverityLevel)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <option value="all">{t('analysis_filter_severity')}</option>
            <option value="high">{t('severity_high')}</option>
            <option value="medium">{t('severity_medium')}</option>
            <option value="low">{t('severity_low')}</option>
          </select>

          {/* Zone Filter */}
          <label htmlFor="zone-filter" className="sr-only">
            {t('analysis_filter_all_zones')}
          </label>
          <select
            id="zone-filter"
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <option value="all">{t('analysis_filter_all_zones')}</option>
            {analytics.zones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>

          {/* Rule Filter */}
          <label htmlFor="rule-filter" className="sr-only">
            Filter by Anomaly Rule
          </label>
          <select
            id="rule-filter"
            value={ruleFilter}
            onChange={(e) => setRuleFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <option value="all">All Anomaly Rules</option>
            <option value="off_hours_waste">Off-Hours Waste</option>
            <option value="statistical_spike">Statistical Spike</option>
            <option value="weekend_ghost_load">Weekend Ghost Load</option>
            <option value="basal_load_drift">Basal Load Drift</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-600 dark:text-slate-300">
            Showing {formatNum(filteredAnomalies.length)} of {formatNum(analytics.anomalies.length)} findings
          </span>
        </div>
      </div>

      {/* Findings Table */}
      <div className="rounded-2xl glass-panel overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs" aria-label="Detected Campus Energy Anomalies">
            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th scope="col" className="px-4 py-3">{t('analysis_col_id')}</th>
                <th scope="col" className="px-4 py-3">{t('analysis_col_zone')}</th>
                <th scope="col" className="px-4 py-3">{t('analysis_col_timestamp')}</th>
                <th scope="col" className="px-4 py-3">{t('analysis_col_measured')}</th>
                <th scope="col" className="px-4 py-3">{t('analysis_col_baseline')}</th>
                <th scope="col" className="px-4 py-3">{t('analysis_col_excess')}</th>
                <th scope="col" className="px-4 py-3">{t('analysis_col_deviation')}</th>
                <th scope="col" className="px-4 py-3">{t('analysis_col_severity')}</th>
                <th scope="col" className="px-4 py-3">{t('analysis_col_explanation')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300 font-mono">
              {paginatedAnomalies.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                  <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                    {a.id}
                  </td>
                  <td className="px-4 py-3 font-sans font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {a.zone}
                  </td>
                  <td className="px-4 py-3 font-sans text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {formatDateStr(a.timestamp)}
                  </td>
                  <td className="px-4 py-3 text-slate-900 dark:text-slate-100 font-semibold">
                    {formatNum(a.kwh, 1, 1)}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
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
                      {t(getSeverityTranslationKey(a.severity))}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-sans text-slate-600 dark:text-slate-300 max-w-xs leading-relaxed">
                    <div className="flex items-center gap-1.5 font-semibold text-[11px] text-slate-800 dark:text-slate-200 mb-0.5">
                      {getRuleIcon(a.rule)}
                      <span>{a.ruleLabel}</span>
                    </div>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400">
                      {a.explanation}
                    </span>
                  </td>
                </tr>
              ))}
              {paginatedAnomalies.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500 font-sans">
                    No anomaly findings match the selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-mono">
              Page {currentPage} of {totalPages} ({filteredAnomalies.length} total)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 flex items-center gap-1"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Previous</span>
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 flex items-center gap-1"
                aria-label="Next page"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
