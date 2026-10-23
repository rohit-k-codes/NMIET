import React from 'react';
import {
  Zap,
  Building2,
  AlertOctagon,
  TrendingDown,
  DollarSign,
  Gauge,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { useApp } from '../../context/AppContext';

export const OverviewTab: React.FC = () => {
  const {
    analytics,
    readings,
    savingsResult,
    savingsScenario,
    setActiveTab,
    runAiOptimizer,
    isOptimizing,
    isDemoData,
    theme,
    t,
    formatNum,
    formatKwhNum,
    formatMoney,
    formatDateStr,
  } = useApp();

  // Hourly aggregated trend data for chart
  const chartData = React.useMemo(() => {
    const timeMap = new Map<string, Record<string, number>>();
    for (const r of readings) {
      const timeLabel = formatDateStr(r.timestamp);
      if (!timeMap.has(timeLabel)) {
        timeMap.set(timeLabel, { total: 0 });
      }
      const entry = timeMap.get(timeLabel)!;
      entry[r.zone] = (entry[r.zone] || 0) + r.kwh;
      entry.total = Number(((entry.total || 0) + r.kwh).toFixed(1));
    }

    return Array.from(timeMap.entries())
      .map(([time, zonesData]) => ({
        timestamp: time,
        ...zonesData,
      }))
      .slice(0, 56);
  }, [readings, formatDateStr]);

  // Zone comparison bar data
  const zoneBarData = React.useMemo(() => {
    if (!analytics) return [];
    return Object.values(analytics.zoneSummaries).map((z) => ({
      name: z.zone.replace('Campus ', '').replace(' Complex', '').replace(' & Dining', ''),
      totalKwh: z.totalKwh,
      offHoursKwh: z.offHoursKwh,
      wasteKwh: z.totalWasteKwh,
    }));
  }, [analytics]);

  const isDark = theme === 'dark';
  const gridStroke = isDark ? '#1e293b' : '#e2e8f0';
  const axisColor = isDark ? '#94a3b8' : '#64748b';
  const tooltipBg = isDark ? '#0f172a' : '#ffffff';
  const tooltipBorder = isDark ? '#334155' : '#cbd5e1';
  const tooltipColor = isDark ? '#f8fafc' : '#0f172a';

  if (!analytics) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center text-slate-400">
        <Gauge className="h-12 w-12 text-slate-500 mb-4 animate-spin" />
        <p className="text-sm font-semibold">{t('overview_title')}</p>
        <p className="text-xs text-slate-500 mt-1">Analyzing campus energy telemetry...</p>
      </div>
    );
  }

  const wastePct = analytics.totalKwh > 0 ? ((analytics.totalWasteKwh / analytics.totalKwh) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Notice */}
      <div className="rounded-2xl p-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/25 dark:border-emerald-500/20 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              {isDemoData ? t('banner_demo_active') : t('banner_custom_active')}
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {t('banner_heading')}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
            {t('banner_description')}
          </p>
        </div>

        <button
          onClick={() => runAiOptimizer()}
          disabled={isOptimizing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50"
        >
          <Sparkles className="h-4 w-4" />
          <span>{isOptimizing ? t('btn_agent_running') : t('btn_run_agent_quick')}</span>
        </button>
      </div>

      {/* KPI Cards: Measured vs Estimated Distinction */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Consumption (Measured) */}
        <div className="p-5 rounded-2xl glass-panel space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>{t('kpi_total_consumption')}</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
            {formatKwhNum(analytics.totalKwh, 0)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{t('kpi_sub_measured')}</span>
          </div>
        </div>

        {/* Metric 2: Identified Waste (Observed Deviation) */}
        <div className="p-5 rounded-2xl glass-panel space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>{t('kpi_total_waste')}</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
            {formatKwhNum(analytics.totalWasteKwh, 0)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-rose-600 dark:text-rose-400">{wastePct}%</span> {t('kpi_sub_waste_pct')}
          </div>
        </div>

        {/* Metric 3: Anomalies Detected */}
        <div className="p-5 rounded-2xl glass-panel space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>{t('kpi_anomalies_detected')}</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertOctagon className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {formatNum(analytics.anomalies.length)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            <span>{t('kpi_sub_across_zones')}</span>
          </div>
        </div>

        {/* Metric 4: Estimated Savings (Scenario Model) */}
        <div className="p-5 rounded-2xl glass-panel space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>{t('kpi_potential_savings')}</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-600 dark:text-cyan-400">
            {savingsResult ? formatMoney(savingsResult.costSavingsCurrency) : '$0'}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>{savingsResult ? formatMoney(savingsResult.annualCostSavingsCurrency, 0) : '$0'}/yr</span>
            <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold uppercase">Scenario Est.</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Area Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {t('chart_campus_timeline')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('chart_campus_timeline_desc')}
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="timestamp" stroke={axisColor} fontSize={10} tickLine={false} />
                <YAxis stroke={axisColor} fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: tooltipBg,
                    borderColor: tooltipBorder,
                    borderRadius: '12px',
                    color: tooltipColor,
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                  formatter={(val: any) => [`${formatNum(Number(val))} kWh`, 'Campus Load']}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Operational Insight Card */}
        <div className="p-5 rounded-2xl glass-panel space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <Sparkles className="h-4 w-4" />
              <span>{t('insight_card_title')}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('insight_card_body')}
            </p>

            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Off-Hours Total:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {formatKwhNum(analytics.offHoursKwh, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Peak Demand Load:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {formatKwhNum(analytics.peakHoursKwh, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Monitored Facilities:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {analytics.zoneCount} Zones
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('ai-agent')}
            className="w-full mt-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center gap-2 transition-colors"
          >
            <span>{t('btn_run_agent_quick')}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Building Breakdown Chart */}
      <div className="p-5 rounded-2xl glass-panel space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {t('chart_facility_breakdown')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('chart_facility_breakdown_desc')}
          </p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={zoneBarData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="name" stroke={axisColor} fontSize={10} tickLine={false} />
              <YAxis stroke={axisColor} fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  borderColor: tooltipBorder,
                  borderRadius: '12px',
                  color: tooltipColor,
                  fontSize: '12px',
                }}
                formatter={(val: any) => [`${formatNum(Number(val))} kWh`]}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="totalKwh" name={t('chart_legend_total')} fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="offHoursKwh" name={t('chart_legend_offhours')} fill="#06b6d4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="wasteKwh" name={t('chart_legend_waste')} fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
