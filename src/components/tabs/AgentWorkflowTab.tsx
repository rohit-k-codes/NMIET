import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  ArrowRight,
  Terminal,
  Cpu,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ShieldAlert,
  Sliders,
  DollarSign,
  TrendingDown,
  Wrench,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  FileCheck2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TranslationKey } from '../../i18n/types';

export const AgentWorkflowTab: React.FC = () => {
  const {
    analytics,
    optimizationPlan,
    runAiOptimizer,
    isOptimizing,
    savingsScenario,
    setSavingsScenario,
    setActiveTab,
    apiHealth,
    t,
    formatNum,
    formatKwhNum,
    formatMoney,
    formatPercentNum,
    formatTimeStr,
  } = useApp();

  const [selectedObjective, setSelectedObjective] = useState<string>('Maximize Energy Conservation');
  const [customObjective, setCustomObjective] = useState<string>('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const objectiveOptions: { key: TranslationKey; value: string }[] = [
    { key: 'agent_obj_max_conservation', value: 'Maximize Energy Conservation' },
    { key: 'agent_obj_offhours_waste', value: 'Deep Off-Hours Waste Elimination' },
    { key: 'agent_obj_peak_shaving', value: 'Peak Demand Shaving & Equipment Surge' },
    { key: 'agent_obj_cost_reduction', value: 'Executive Cost Reduction & Carbon Avoidance' },
  ];

  const handleRunAgent = () => {
    if (isOptimizing) return;
    const objective = customObjective.trim() || selectedObjective;
    runAiOptimizer(objective);
  };

  const getHumanFriendlyStep = (toolName?: string, type?: string) => {
    if (toolName === 'inspect_energy_data') {
      return {
        title: t('agent_step_review_data'),
        icon: Search,
        badgeColor: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
      };
    }
    if (toolName === 'calculate_savings_scenario') {
      return {
        title: t('agent_step_eval_scenarios'),
        icon: TrendingDown,
        badgeColor: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      };
    }
    if (toolName === 'draft_maintenance_task') {
      return {
        title: t('agent_step_prepare_actions'),
        icon: Wrench,
        badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
      };
    }
    if (type === 'output') {
      return {
        title: t('agent_step_await_review'),
        icon: CheckCircle2,
        badgeColor: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
      };
    }
    return {
      title: 'Autonomous System Step',
      icon: Sparkles,
      badgeColor: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    };
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Bot className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span>{t('agent_title')}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('agent_subtitle')}
          </p>
        </div>

        {/* Engine Status Badge - Polished Product Presentation */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
          <Cpu className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-slate-600 dark:text-slate-300">
            {t('agent_engine_status')}{' '}
            <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">
              {apiHealth?.isGeminiConfigured ? t('badge_ai_operational') : t('badge_fallback_engine')}
            </strong>
          </span>
        </div>
      </div>

      {/* Agent Launch Control Station */}
      <div className="p-5 rounded-2xl glass-panel space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Sliders className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>{t('agent_config_title')}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Preset Objectives */}
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {t('agent_select_objective')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {objectiveOptions.map((obj) => (
                <button
                  key={obj.value}
                  onClick={() => {
                    setSelectedObjective(obj.value);
                    setCustomObjective('');
                  }}
                  className={`p-3 rounded-xl text-xs text-left font-semibold transition-all border ${
                    selectedObjective === obj.value && !customObjective
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-sm'
                      : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {t(obj.key)}
                </button>
              ))}
            </div>

            {/* Custom Objective Option */}
            <input
              id="agent-custom-objective"
              type="text"
              aria-label={t('agent_custom_objective_placeholder')}
              placeholder={t('agent_custom_objective_placeholder')}
              value={customObjective}
              onChange={(e) => setCustomObjective(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 mt-2"
            />
          </div>

          {/* Electricity Tariff Slider */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                {t('agent_tariff_label')}
              </span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                {formatMoney(savingsScenario.electricityTariff, 2)}/kWh
              </span>
            </div>

            <label htmlFor="agent-tariff-slider" className="sr-only">
              {t('agent_tariff_label')}
            </label>
            <input
              id="agent-tariff-slider"
              type="range"
              min="0.05"
              max="0.60"
              step="0.01"
              value={savingsScenario.electricityTariff}
              aria-label={t('agent_tariff_label')}
              aria-valuemin={0.05}
              aria-valuemax={0.60}
              aria-valuenow={savingsScenario.electricityTariff}
              aria-valuetext={`$${savingsScenario.electricityTariff}/kWh`}
              onChange={(e) =>
                setSavingsScenario((prev) => ({
                  ...prev,
                  electricityTariff: Number(e.target.value),
                }))
              }
              className="w-full accent-emerald-500 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            />

            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>$0.05</span>
              <span>$0.30</span>
              <span>$0.60</span>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={handleRunAgent}
                disabled={isOptimizing || !analytics}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                <span>{isOptimizing ? t('btn_agent_running') : t('btn_execute_agent')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Optimization Strategy & Executive Summary */}
      {optimizationPlan && (
        <div className="p-5 rounded-2xl glass-panel space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t('agent_summary_title')}</span>
            </h3>

            <button
              onClick={() => setActiveTab('action-center')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors"
            >
              <span>{t('nav_action_center')} ({optimizationPlan.actions.length} tasks)</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                {t('agent_strategy_label')}
              </h4>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed bg-white/70 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                {optimizationPlan.strategySummary}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  {t('agent_waste_eval_label')}
                </h4>
                <p className="text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 leading-relaxed">
                  {optimizationPlan.identifiedWasteSummary}
                </p>
              </div>

              <div>
                <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                  {t('agent_confidence_label')}
                </h4>
                <div className="bg-white/50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Confidence Rating:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {formatPercentNum(optimizationPlan.overallConfidence * 100, 0)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${optimizationPlan.overallConfidence * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    {t('agent_confidence_desc')}
                  </span>
                </div>
              </div>
            </div>

            {/* Assumptions & Disclosures */}
            {optimizationPlan.missingDataWarnings.length > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1 text-xs text-amber-800 dark:text-amber-200">
                <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-300">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>{t('agent_warnings_label')}:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-300 pl-1 text-[11px]">
                  {optimizationPlan.missingDataWarnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Agent Workflow Execution Progress Timeline */}
      <div className="p-5 rounded-2xl glass-panel space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t('agent_timeline_title')}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('agent_timeline_subtitle')}
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {optimizationPlan ? formatNum(optimizationPlan.executionLogs.length) : '0'} Steps
          </span>
        </div>

        {optimizationPlan && optimizationPlan.executionLogs.length > 0 ? (
          <div className="space-y-3">
            {optimizationPlan.executionLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              const stepInfo = getHumanFriendlyStep(log.toolName, log.type);
              const Icon = stepInfo.icon;

              return (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2 transition-colors hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                      </div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                        {stepInfo.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {formatTimeStr(log.timestamp)}
                    </span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-sans pl-6.5">
                    {log.content}
                  </p>

                  {/* Collapsed Technical Audit Payload (For evaluators) */}
                  {(log.toolArgs || log.toolResult) && (
                    <div className="pl-6.5 pt-1">
                      <button
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className="text-[10px] font-mono text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 inline-flex items-center gap-1 underline"
                      >
                        <span>{isExpanded ? 'Hide Verification Data' : 'Inspect Audit Record'}</span>
                        {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>

                      {isExpanded && (
                        <pre className="mt-2 p-3 rounded-xl bg-slate-950 font-mono text-[10px] text-emerald-300/90 overflow-x-auto border border-slate-800">
                          {JSON.stringify(log.toolArgs || log.toolResult, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-10 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
            <Bot className="h-8 w-8 text-slate-400 dark:text-slate-600 mx-auto" />
            <p className="font-medium">{t('agent_empty_timeline')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
