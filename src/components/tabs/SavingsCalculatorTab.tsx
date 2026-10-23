import React from 'react';
import {
  Calculator,
  DollarSign,
  TrendingDown,
  Leaf,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SavingsCalculatorTab: React.FC = () => {
  const {
    analytics,
    savingsScenario,
    setSavingsScenario,
    savingsResult,
    setActiveTab,
    t,
    formatNum,
    formatKwhNum,
    formatMoney,
    formatPercentNum,
  } = useApp();

  if (!analytics || !savingsResult) return null;

  const presetReductions = [
    { label: '5% (Conservative)', value: 5 },
    { label: '15% (Moderate)', value: 15 },
    { label: '30% (Aggressive Retrofit)', value: 30 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Calculator className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <span>{t('calc_title')}</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('calc_subtitle')}
        </p>
      </div>

      {/* Scenario Controls Panel */}
      <div className="p-6 rounded-2xl glass-panel space-y-6">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>{t('calc_assumptions_title')}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Control 1: Reduction Percentage */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {t('calc_target_reduction')}
              </span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">
                {formatPercentNum(savingsScenario.targetReductionPct, 0)}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={savingsScenario.targetReductionPct}
              onChange={(e) =>
                setSavingsScenario((prev) => ({
                  ...prev,
                  targetReductionPct: Number(e.target.value),
                }))
              }
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {presetReductions.map((p) => (
                <button
                  key={p.value}
                  onClick={() =>
                    setSavingsScenario((prev) => ({
                      ...prev,
                      targetReductionPct: p.value,
                    }))
                  }
                  className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-all ${
                    savingsScenario.targetReductionPct === p.value
                      ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              Target portion of identified waste remediated through scheduling or setpoint fixes.
            </p>
          </div>

          {/* Control 2: Electricity Tariff */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {t('calc_tariff_rate')}
              </span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                {formatMoney(savingsScenario.electricityTariff, 2)}/kWh
              </span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.60"
              step="0.01"
              value={savingsScenario.electricityTariff}
              onChange={(e) =>
                setSavingsScenario((prev) => ({
                  ...prev,
                  electricityTariff: Number(e.target.value),
                }))
              }
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>$0.05</span>
              <span>$0.30</span>
              <span>$0.60</span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              Campus blended utility rate per kilowatt-hour including capacity charges.
            </p>
          </div>

          {/* Control 3: Facility Scope */}
          <div className="space-y-3">
            <span className="font-semibold text-xs text-slate-700 dark:text-slate-200 block">
              {t('calc_target_facility')}
            </span>
            <select
              value={savingsScenario.targetZone || 'all'}
              onChange={(e) =>
                setSavingsScenario((prev) => ({
                  ...prev,
                  targetZone: e.target.value,
                }))
              }
              className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-400"
            >
              <option value="all">{t('calc_all_facilities')}</option>
              {analytics.zones.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              Scope calculation to the entire campus or target a single high-priority facility.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Baseline Waste in Scope */}
        <div className="p-5 rounded-2xl glass-panel space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{t('calc_kpi_baseline_waste')}</span>
            <Layers className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
            {formatKwhNum(savingsResult.eligibleBaselineWasteKwh, 1)}
          </div>
          <p className="text-[10px] text-slate-400">Empirically measured excess</p>
        </div>

        {/* Achievable Energy Cut */}
        <div className="p-5 rounded-2xl glass-panel space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{t('calc_kpi_achievable_cut')}</span>
            <TrendingDown className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {formatKwhNum(savingsResult.energySavingsKwh, 1)}
          </div>
          <p className="text-[10px] text-slate-400">
            {formatPercentNum(savingsScenario.targetReductionPct, 0)} of baseline waste
          </p>
        </div>

        {/* Weekly Cost Savings */}
        <div className="p-5 rounded-2xl glass-panel space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{t('calc_kpi_weekly_savings')}</span>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {formatMoney(savingsResult.costSavingsCurrency, 2)}
          </div>
          <p className="text-[10px] text-slate-400">Direct utility billing savings</p>
        </div>

        {/* Annualized Cost Savings */}
        <div className="p-5 rounded-2xl glass-panel space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{t('calc_kpi_annual_savings')}</span>
            <Calendar className="h-4 w-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-600 dark:text-cyan-400">
            {formatMoney(savingsResult.annualCostSavingsCurrency, 0)}
          </div>
          <p className="text-[10px] text-slate-400">Annual recurring benefit</p>
        </div>
      </div>

      {/* Transparent Mathematical Formula Breakdown */}
      <div className="p-5 rounded-2xl glass-panel space-y-3">
        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
          <Calculator className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>{t('calc_formula_title')}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 font-mono text-xs text-slate-800 dark:text-emerald-300 leading-relaxed border border-slate-200 dark:border-slate-800">
          {savingsResult.formula}
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {t('calc_formula_desc')}
        </p>
      </div>

      {/* Estimation Methodology Disclaimer */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-slate-900 dark:text-slate-100">
            {t('calc_disclaimer_title')}
          </span>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
            {t('calc_disclaimer_body')}
          </p>
        </div>
      </div>
    </div>
  );
};
