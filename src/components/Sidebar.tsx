import React from 'react';
import {
  LayoutDashboard,
  UploadCloud,
  BarChart3,
  Bot,
  CheckSquare,
  Calculator,
  Settings,
  AlertTriangle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useApp, TabType } from '../context/AppContext';

interface NavItem {
  id: TabType;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, analytics, actionTasks, t, formatNum } = useApp();

  const pendingTasksCount = actionTasks.filter((t) => t.status === 'pending').length;

  const navItems = [
    {
      id: 'overview' as TabType,
      label: t('nav_overview'),
      icon: LayoutDashboard,
    },
    {
      id: 'data-import' as TabType,
      label: t('nav_data_import'),
      icon: UploadCloud,
    },
    {
      id: 'data-analysis' as TabType,
      label: t('nav_analytics'),
      icon: BarChart3,
      badge: analytics ? formatNum(analytics.anomalies.length) : undefined,
      badgeColor: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
    },
    {
      id: 'ai-agent' as TabType,
      label: t('nav_ai_agent'),
      icon: Bot,
      badge: 'Agentic',
      badgeColor: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
    },
    {
      id: 'action-center' as TabType,
      label: t('nav_action_center'),
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? formatNum(pendingTasksCount) : undefined,
      badgeColor: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
    },
    {
      id: 'savings-calculator' as TabType,
      label: t('nav_savings_calculator'),
      icon: Calculator,
    },
    {
      id: 'settings' as TabType,
      label: t('nav_settings'),
      icon: Settings,
    },
  ];

  return (
    <aside className="w-full lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200/90 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-3 lg:p-4 flex lg:flex-col justify-between overflow-x-auto lg:overflow-x-visible transition-colors">
      <nav className="flex lg:flex-col gap-1.5 w-full" aria-label="Sidebar Navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    item.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Operational Policy & Governance Card */}
      <div className="hidden lg:block mt-6 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Campus Energy Policy</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          Off-hours baselines apply 22:00–06:00. Action recommendations require human facility sign-off.
        </p>
      </div>
    </aside>
  );
};
