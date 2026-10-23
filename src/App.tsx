import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { OverviewTab } from './components/tabs/OverviewTab';
import { DataImportTab } from './components/tabs/DataImportTab';
import { DataAnalysisTab } from './components/tabs/DataAnalysisTab';
import { AgentWorkflowTab } from './components/tabs/AgentWorkflowTab';
import { ActionCenterTab } from './components/tabs/ActionCenterTab';
import { SavingsCalculatorTab } from './components/tabs/SavingsCalculatorTab';
import { SettingsTab } from './components/tabs/SettingsTab';
import { SystemDiagnosticsTab } from './components/tabs/SystemDiagnosticsTab';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Zap, ShieldCheck, CheckCircle2 } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'data-import' && <DataImportTab />}
      {activeTab === 'data-analysis' && <DataAnalysisTab />}
      {activeTab === 'ai-agent' && <AgentWorkflowTab />}
      {activeTab === 'action-center' && <ActionCenterTab />}
      {activeTab === 'savings-calculator' && <SavingsCalculatorTab />}
      {activeTab === 'settings' && <SettingsTab />}
      {activeTab === 'system-diagnostics' && <SystemDiagnosticsTab />}
    </main>
  );
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-150">
          <Header />

          <div className="flex-1 flex flex-col lg:flex-row">
            <Sidebar />
            <MainContent />
          </div>

          {/* Professional Global Enterprise Footer */}
          <footer className="border-t border-slate-200/90 dark:border-slate-900 bg-white/80 dark:bg-slate-950 px-4 lg:px-8 py-3.5 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-between gap-3 transition-colors">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-bold text-slate-800 dark:text-slate-300">WattWise AI</span>
              <span>•</span>
              <span>Autonomous Campus Energy Optimization Platform</span>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Zero-Database In-Memory Session</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
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
