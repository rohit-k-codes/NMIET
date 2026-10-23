import React, { useState, useRef, useEffect } from 'react';
import {
  Zap,
  Download,
  Database,
  FileSpreadsheet,
  FileText,
  Sun,
  Moon,
  Monitor,
  Sparkles,
  RefreshCw,
  Cpu,
  Globe,
  ChevronDown,
} from 'lucide-react';
import { useApp, ThemeMode } from '../context/AppContext';
import { Language, getThemeModeTranslationKey } from '../i18n/types';
import { ConfirmationModal } from './ConfirmationModal';

export const Header: React.FC = () => {
  const {
    isDemoData,
    readings,
    analytics,
    loadDemoData,
    exportReportJson,
    exportFindingsCsv,
    exportActionsCsv,
    actionTasks,
    themeMode,
    setThemeMode,
    theme,
    toggleTheme,
    language,
    setLanguage,
    t,
    formatNum,
    apiHealth,
    isAnalyzing,
  } = useApp();

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const exportMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);

    // Close dropdowns on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setShowThemeMenu(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowExportMenu(false);
        setShowLangMenu(false);
        setShowThemeMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const languageLabels: Record<Language, { label: string; short: string }> = {
    en: { label: 'English', short: 'EN' },
    hi: { label: 'हिन्दी', short: 'HI' },
    mr: { label: 'मराठी', short: 'MR' },
  };

  return (
    <header role="banner" className="sticky top-0 z-40 w-full border-b border-slate-200/90 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/85 backdrop-blur-md px-4 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4 transition-colors">
      {/* Brand & Tagline */}
      <div className="flex items-center gap-3.5">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20 flex items-center justify-center shrink-0">
          <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Zap className="h-5 w-5 text-emerald-400 fill-emerald-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-slate-100">
              {t('brand_name')}
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400">
              Campus Intelligence
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
            {t('brand_tagline')}
          </p>
        </div>
      </div>

      {/* Dynamic Status Badges & Global Controls */}
      <div className="flex items-center flex-wrap gap-2.5">
        {/* Dataset Origin Badge */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
            isDemoData
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
          }`}
          title={isDemoData ? t('badge_demo_dataset') : t('badge_custom_dataset')}
        >
          <Database className="h-3.5 w-3.5" />
          <span>{isDemoData ? t('badge_demo_dataset') : t('badge_custom_dataset')}</span>
          <span className="opacity-75 font-mono text-[11px]">({formatNum(readings.length)} pts)</span>
        </div>

        {/* Engine Status Badge - Clean Product Presentation */}
        <div
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-teal-500/10 border-teal-500/30 text-teal-700 dark:text-teal-300"
          title="Optimization Reasoning Engine"
        >
          <Cpu className="h-3.5 w-3.5" />
          <span>
            {apiHealth?.isGeminiConfigured ? t('badge_ai_operational') : t('badge_fallback_engine')}
          </span>
        </div>

        {/* Reload Demo Button */}
        <button
          onClick={() => setShowResetModal(true)}
          disabled={isAnalyzing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          aria-label={t('btn_reset_demo')}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isAnalyzing ? 'animate-spin text-emerald-500' : ''}`} />
          <span className="hidden md:inline">{t('btn_reset_demo')}</span>
        </button>

        {/* Language Selector Dropdown */}
        <div className="relative" ref={langMenuRef}>
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            aria-label={t('btn_switch_language')}
            aria-expanded={showLangMenu}
          >
            <Globe className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold">{languageLabels[language].short}</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl py-1 z-50 animate-in fade-in">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                {t('btn_switch_language')}
              </div>
              {(['en', 'hi', 'mr'] as Language[]).map((langId) => (
                <button
                  key={langId}
                  onClick={() => {
                    setLanguage(langId);
                    setShowLangMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                    language === langId
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{languageLabels[langId].label}</span>
                  <span className="text-[10px] font-mono opacity-60">{languageLabels[langId].short}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Switcher Dropdown */}
        <div className="relative" ref={themeMenuRef}>
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            aria-label={t('btn_switch_theme')}
            aria-expanded={showThemeMenu}
          >
            {themeMode === 'system' ? (
              <Monitor className="h-4 w-4" />
            ) : theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          {showThemeMenu && (
            <div className="absolute right-0 mt-2 w-36 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl py-1 z-50 animate-in fade-in">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                {t('btn_switch_theme')}
              </div>
              {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setThemeMode(mode);
                    setShowThemeMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 transition-colors ${
                    themeMode === mode
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {mode === 'light' ? (
                    <Sun className="h-3.5 w-3.5" />
                  ) : mode === 'dark' ? (
                    <Moon className="h-3.5 w-3.5" />
                  ) : (
                    <Monitor className="h-3.5 w-3.5" />
                  )}
                  <span className="capitalize">{t(getThemeModeTranslationKey(mode))}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Export Dropdown */}
        <div className="relative" ref={exportMenuRef}>
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={!analytics}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:opacity-50"
            aria-label={t('btn_export')}
            aria-expanded={showExportMenu}
          >
            <Download className="h-3.5 w-3.5" />
            <span>{t('btn_export')}</span>
          </button>

          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl py-1 z-50 animate-in fade-in">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                {t('btn_export')}
              </div>
              <button
                onClick={() => {
                  exportReportJson();
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3 py-2.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
              >
                <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{t('btn_export_json')}</span>
              </button>
              <button
                onClick={() => {
                  exportFindingsCsv();
                  setShowExportMenu(false);
                }}
                className="w-full text-left px-3 py-2.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
              >
                <FileSpreadsheet className="h-4 w-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span>{t('btn_export_findings_csv')}</span>
              </button>
              <button
                onClick={() => {
                  exportActionsCsv();
                  setShowExportMenu(false);
                }}
                disabled={actionTasks.length === 0}
                className="w-full text-left px-3 py-2.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 disabled:opacity-40"
              >
                <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>{t('btn_export_actions_csv')} ({actionTasks.length})</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Resetting Demo */}
      <ConfirmationModal
        isOpen={showResetModal}
        title={t('modal_confirm_title')}
        message={t('modal_confirm_reset_desc')}
        isDestructive={false}
        onConfirm={() => {
          loadDemoData();
          setShowResetModal(false);
        }}
        onCancel={() => setShowResetModal(false)}
      />
    </header>
  );
};
