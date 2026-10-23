import React, { Suspense, lazy } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Zap, ShieldCheck, CheckCircle2 } from 'lucide-react';

// Route/Tab-level Code Splitting via React.lazy
const OverviewTab = lazy(() =>
  import('./components/tabs/OverviewTab').then((m) => ({ default: m.OverviewTab }))
);
const DataImportTab = lazy(() =>
  import('./components/tabs/DataImportTab').then((m) => ({ default: m.DataImportTab }))
);
const DataAnalysisTab = lazy(() =>
  import('./components/tabs/DataAnalysisTab').then((m) => ({ default: m.DataAnalysisTab }))
);
const AgentWorkflowTab = lazy(() =>
  import('./components/tabs/AgentWorkflowTab').then((m) => ({ default: m.AgentWorkflowTab }))
);
const ActionCenterTab = lazy(() =>
  import('./components/tabs/ActionCenterTab').then((m) => ({ default: m.ActionCenterTab }))
);
const SavingsCalculatorTab = lazy(() =>
  import('./components/tabs/SavingsCalculatorTab').then((m) => ({ default: m.SavingsCalculatorTab }))
);
const SettingsTab = lazy(() =>
  import('./components/tabs/SettingsTab').then((m) => ({ default: m.SettingsTab }))
);
const SystemDiagnosticsTab = lazy(() =>
  import('./components/tabs/SystemDiagnosticsTab').then((m) => ({ default: m.SystemDiagnosticsTab }))
);

/**
 * Accessible Skeleton loader for asynchronous tab rendering
 */
const TabLoadingSkeleton: React.FC = () => (
  <div
    role="status"
    aria-busy="true"
    aria-label="Loading tab content"
    className="space-y-4 animate-pulse p-2"
  >
    <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/4"></div>
    <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
      <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
      <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
      <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
    </div>
    <span className="sr-only">Loading section content...</span>
  </div>
);

/**
 * WCAG 2.4.1 Skip Link to bypass navigation landmarks
 */
const SkipToContent: React.FC = () => {
  const { t } = useApp();
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-emerald-600 focus:text-white focus:text-xs focus:font-bold focus:rounded-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 dark:focus:ring-offset-slate-950 transition-all"
    >
      {t('skip_to_content')}
    </a>
  );
};

/**
 * WCAG 4.1.3 Live Region for Dynamic Screen Reader Announcements
 */
const ScreenReaderAnnouncer: React.FC = () => {
  const { announcement } = useApp();
  return (
    <div
      id="a11y-announcer"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
};

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main
      id="main-content"
      role="tabpanel"
      aria-labelledby={`tab-${activeTab}`}
      tabIndex={0}
      className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto focus-visible:outline-none"
    >
      <Suspense fallback={<TabLoadingSkeleton />}>
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'data-import' && <DataImportTab />}
        {activeTab === 'data-analysis' && <DataAnalysisTab />}
        {activeTab === 'ai-agent' && <AgentWorkflowTab />}
        {activeTab === 'action-center' && <ActionCenterTab />}
        {activeTab === 'savings-calculator' && <SavingsCalculatorTab />}
        {activeTab === 'settings' && <SettingsTab />}
        {activeTab === 'system-diagnostics' && <SystemDiagnosticsTab />}
      </Suspense>
    </main>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-150">
          <SkipToContent />
          <ScreenReaderAnnouncer />
          <Header />

          <div className="flex-1 flex flex-col lg:flex-row">
            <Sidebar />
            <MainContent />
          </div>

          {/* Professional Global Enterprise Footer */}
          <footer
            role="contentinfo"
            className="border-t border-slate-200/90 dark:border-slate-900 bg-white/80 dark:bg-slate-950 px-4 lg:px-8 py-3.5 text-xs text-slate-600 dark:text-slate-400 flex flex-wrap items-center justify-between gap-3 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
              <span className="font-bold text-slate-800 dark:text-slate-200">WattWise AI</span>
              <span aria-hidden="true">•</span>
              <span>Autonomous Campus Energy Optimization Platform</span>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                <span>Zero-Database In-Memory Session</span>
              </span>
              <span aria-hidden="true">•</span>
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" aria-hidden="true" />
                <span>Human-in-the-Loop Governance</span>
              </span>
            </div>
          </footer>
        </div>
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;
