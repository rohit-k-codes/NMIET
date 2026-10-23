import React, { useState } from 'react';
import {
  Settings,
  Sun,
  Moon,
  Monitor,
  Globe,
  Database,
  RefreshCw,
  Trash2,
  ShieldCheck,
  Lock,
  FileCheck,
  Cpu,
  Layers,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useApp, ThemeMode } from '../../context/AppContext';
import { Language } from '../../i18n/types';
import { ConfirmationModal } from '../ConfirmationModal';

export const SettingsTab: React.FC = () => {
  const {
    themeMode,
    setThemeMode,
    theme,
    language,
    setLanguage,
    t,
    loadDemoData,
    clearSessionData,
    readings,
    analytics,
    diagnostics,
    setActiveTab,
  } = useApp();

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
    isDestructive: boolean;
  }>({
    isOpen: false,
    title: '',
    message: '',
    action: () => {},
    isDestructive: false,
  });

  const handleResetDemoClick = () => {
    setConfirmModal({
      isOpen: true,
      title: t('modal_confirm_title'),
      message: t('modal_confirm_reset_desc'),
      isDestructive: false,
      action: () => {
        loadDemoData();
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleClearDataClick = () => {
    setConfirmModal({
      isOpen: true,
      title: t('modal_confirm_title'),
      message: t('modal_confirm_clear_desc'),
      isDestructive: true,
      action: () => {
        clearSessionData();
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const languages: { id: Language; label: string; script: string }[] = [
    { id: 'en', label: 'English', script: 'English (US)' },
    { id: 'hi', label: 'हिन्दी', script: 'Hindi (India)' },
    { id: 'mr', label: 'मराठी', script: 'Marathi (Maharashtra)' },
  ];

  const themes: { id: ThemeMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'light', label: t('theme_light'), icon: Sun },
    { id: 'dark', label: t('theme_dark'), icon: Moon },
    { id: 'system', label: t('theme_system'), icon: Monitor },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Settings className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <span>{t('settings_title')}</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('settings_subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance & Theme Card */}
        <div className="p-5 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Sun className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {t('settings_appearance_title')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('settings_appearance_desc')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            {themes.map((item) => {
              const Icon = item.icon;
              const isSelected = themeMode === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setThemeMode(item.id)}
                  className={`p-3.5 rounded-xl border flex flex-col items-center gap-2 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-sm'
                      : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                  aria-pressed={isSelected}
                >
                  <Icon className={`h-5 w-5 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Effective Theme:</span>
            <span className="font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {theme} mode active
            </span>
          </div>
        </div>

        {/* Language & Localization Card */}
        <div className="p-5 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {t('settings_language_title')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('settings_language_desc')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            {languages.map((lang) => {
              const isSelected = language === lang.id;
              return (
                <button
                  key={lang.id}
                  onClick={() => setLanguage(lang.id)}
                  className={`p-3.5 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-sm'
                      : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                  aria-pressed={isSelected}
                >
                  <span className="text-base">{lang.label}</span>
                  <span className="text-[10px] font-normal text-slate-400">{lang.script}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Selected Locale:</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">
              {language === 'en' ? 'en-US' : language === 'hi' ? 'hi-IN' : 'mr-IN'}
            </span>
          </div>
        </div>
      </div>

      {/* Session Data & Telemetry Controls */}
      <div className="p-5 rounded-2xl glass-panel space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {t('settings_data_title')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('settings_data_desc')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <span>Active Observations:</span>
            <span className="font-bold text-slate-700 dark:text-slate-200">{readings.length}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleResetDemoClick}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <RefreshCw className="h-4 w-4" />
            <span>{t('btn_reset_demo')}</span>
          </button>

          <button
            onClick={handleClearDataClick}
            disabled={readings.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-slate-300 dark:border-slate-700 hover:border-rose-400 transition-colors disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-rose-400"
          >
            <Trash2 className="h-4 w-4" />
            <span>{t('btn_clear_session_data')}</span>
          </button>

          {/* Quick link to Developer Audit View */}
          <button
            onClick={() => setActiveTab('system-diagnostics')}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Activity className="h-3.5 w-3.5 text-slate-400" />
            <span>{t('nav_diagnostics_dev')}</span>
          </button>
        </div>
      </div>

      {/* Security, Privacy & Architecture Governance */}
      <div className="p-5 rounded-2xl glass-panel space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {t('settings_privacy_title')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('settings_privacy_desc')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-2 font-semibold text-xs text-slate-900 dark:text-slate-100">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>{t('settings_privacy_item1_title')}</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pl-5.5">
              {t('settings_privacy_item1_desc')}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-2 font-semibold text-xs text-slate-900 dark:text-slate-100">
              <Lock className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>{t('settings_privacy_item2_title')}</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pl-5.5">
              {t('settings_privacy_item2_desc')}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-2 font-semibold text-xs text-slate-900 dark:text-slate-100">
              <Cpu className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>{t('settings_privacy_item3_title')}</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pl-5.5">
              {t('settings_privacy_item3_desc')}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="flex items-center gap-2 font-semibold text-xs text-slate-900 dark:text-slate-100">
              <FileCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>{t('settings_privacy_item4_title')}</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pl-5.5">
              {t('settings_privacy_item4_desc')}
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        isDestructive={confirmModal.isDestructive}
        onConfirm={confirmModal.action}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
