import React, { useState } from 'react';
import {
  CheckSquare,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Download,
  AlertTriangle,
  Flame,
  Wrench,
  Lightbulb,
  Cpu,
  FileCheck2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActionStatus, ActionUrgency, ActionCategory } from '../../types/energy';
import {
  ActionFilter,
  getActionFilterTranslationKey,
  getActionStatusTranslationKey,
} from '../../i18n/types';

export const ActionCenterTab: React.FC = () => {
  const {
    actionTasks,
    approveAction,
    dismissAction,
    exportActionsCsv,
    t,
    formatNum,
    formatKwhNum,
    formatMoney,
    formatPercentNum,
    formatDateStr,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | ActionStatus>('all');
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  const filteredTasks = actionTasks.filter((t) => {
    if (statusFilter === 'all') return true;
    return t.status === statusFilter;
  });

  const approvedCount = actionTasks.filter((t) => t.status === 'approved').length;
  const dismissedCount = actionTasks.filter((t) => t.status === 'dismissed').length;
  const pendingCount = actionTasks.filter((t) => t.status === 'pending').length;

  const approvedKwhTotal = actionTasks
    .filter((t) => t.status === 'approved')
    .reduce((sum, t) => sum + t.estimatedKwhReduction, 0);

  const getUrgencyBadge = (urgency: ActionUrgency) => {
    switch (urgency) {
      case 'critical':
      case 'high':
        return 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30';
      case 'medium':
        return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
      default:
        return 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30';
    }
  };

  const getCategoryIcon = (category: ActionCategory) => {
    switch (category) {
      case 'hvac_scheduling':
        return <Wrench className="h-3.5 w-3.5 text-cyan-500" />;
      case 'lighting_retrofit':
        return <Lightbulb className="h-3.5 w-3.5 text-amber-500" />;
      case 'equipment_fault':
        return <Flame className="h-3.5 w-3.5 text-rose-500" />;
      case 'submetering':
        return <Cpu className="h-3.5 w-3.5 text-purple-500" />;
      default:
        return <FileCheck2 className="h-3.5 w-3.5 text-emerald-500" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span>{t('action_center_title')}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('action_center_subtitle')}
          </p>
        </div>

        <button
          onClick={exportActionsCsv}
          disabled={actionTasks.length === 0}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors disabled:opacity-40 shadow-sm"
        >
          <Download className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{t('btn_export_actions_csv')}</span>
        </button>
      </div>

      {/* Governance & Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-slate-900 dark:text-slate-100">
            {t('action_governance_title')}
          </span>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
            {t('action_governance_desc')}
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl glass-panel space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{t('action_kpi_pending')}</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {formatNum(pendingCount)}
          </div>
        </div>

        <div className="p-4 rounded-xl glass-panel space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{t('action_kpi_approved')}</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {formatNum(approvedCount)}
          </div>
        </div>

        <div className="p-4 rounded-xl glass-panel space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{t('action_kpi_dismissed')}</span>
            <XCircle className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-500 dark:text-slate-400">
            {formatNum(dismissedCount)}
          </div>
        </div>

        <div className="p-4 rounded-xl glass-panel space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{t('action_kpi_approved_savings')}</span>
            <Sparkles className="h-4 w-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-600 dark:text-cyan-400">
            {formatKwhNum(approvedKwhTotal, 1)}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {(['all', 'pending', 'approved', 'dismissed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              statusFilter === status
                ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {t(getActionFilterTranslationKey(status))}
          </button>
        ))}
      </div>

      {/* Action Cards List */}
      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => {
            const isPending = task.status === 'pending';
            const isApproved = task.status === 'approved';
            const isDismissed = task.status === 'dismissed';

            return (
              <div
                key={task.id}
                className={`p-5 rounded-2xl glass-panel space-y-4 border transition-all ${
                  isApproved
                    ? 'border-emerald-500/40'
                    : isDismissed
                    ? 'border-slate-300 dark:border-slate-800 opacity-60'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="font-mono text-[11px] text-slate-400">{task.id}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getUrgencyBadge(
                          task.urgency
                        )}`}
                      >
                        {task.urgency} priority
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        {getCategoryIcon(task.category)}
                        <span className="capitalize">{task.category.replace('_', ' ')}</span>
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {task.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Facility: <strong className="text-slate-800 dark:text-slate-200">{task.zone}</strong>
                    </p>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border ${
                        isApproved
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                          : isDismissed
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                          : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {t(getActionStatusTranslationKey(task.status))}
                    </span>
                  </div>
                </div>

                {/* Metric Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Est. Energy Reduction:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatKwhNum(task.estimatedKwhReduction, 1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Est. Cost Savings:</span>
                    <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                      {formatMoney(task.estimatedCostSavings, 2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">{t('action_effort_label')}:</span>
                    <span className="font-semibold capitalize text-slate-700 dark:text-slate-300">
                      {task.implementationEffort} Effort
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">{t('action_confidence_label')}:</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                      {formatPercentNum(task.confidenceScore * 100, 0)}
                    </span>
                  </div>
                </div>

                {/* Steps & Rationale */}
                <div className="space-y-2 text-xs">
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('action_steps_label')}:
                    </h4>
                    <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300 pl-1">
                      {task.recommendedSteps.map((step, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="pt-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                      {t('action_rationale_label')}:
                    </span>{' '}
                    <span className="text-slate-500 dark:text-slate-400">{task.rationale}</span>
                  </div>
                </div>

                {/* Operator Actions & Review Notes */}
                {isPending && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                    <input
                      type="text"
                      aria-label={t('action_review_note_placeholder')}
                      placeholder={t('action_review_note_placeholder')}
                      value={reviewNotes[task.id] || ''}
                      onChange={(e) =>
                        setReviewNotes((prev) => ({ ...prev, [task.id]: e.target.value }))
                      }
                      className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                    />

                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => approveAction(task.id, reviewNotes[task.id])}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{t('btn_approve')}</span>
                      </button>

                      <button
                        onClick={() => dismissAction(task.id, reviewNotes[task.id])}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>{t('btn_dismiss')}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Review Note Display for Completed Actions */}
                {!isPending && task.reviewDecisionNote && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                    <span>
                      Reviewer Note: <em>&ldquo;{task.reviewDecisionNote}&rdquo;</em>
                    </span>
                    {task.reviewedAt && (
                      <span className="font-mono text-[10px]">
                        {formatDateStr(task.reviewedAt)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-12 rounded-xl glass-panel text-center text-xs text-slate-400 space-y-2">
            <CheckSquare className="h-8 w-8 text-slate-400 dark:text-slate-600 mx-auto" />
            <p className="font-medium">No actions found for the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
