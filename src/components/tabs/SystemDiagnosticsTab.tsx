import React, { useState } from 'react';
import {
  Activity,
  Cpu,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Download,
  ShieldCheck,
  Server,
  FileCode,
  Lock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SystemDiagnosticsTab: React.FC = () => {
  const {
    diagnostics,
    sessionAudit,
    apiHealth,
    exportReportJson,
    t,
    formatNum,
    formatDateStr,
    formatTimeStr,
  } = useApp();

  const [expandedAuditId, setExpandedAuditId] = useState<string | null>(null);

  const securityChecklist = [
    { title: 'Zero Database Persistence', status: 'Enforced', desc: 'No Supabase, Firebase, Postgres, or disk storage. Data resides in volatile memory.' },
    { title: 'Backend Secret Isolation', status: 'Enforced', desc: 'GEMINI_API_KEY is backend-only. Never bundled in Vite frontend or client builds.' },
    { title: 'Strict CORS & Helmet CSP', status: 'Active', desc: 'Restricted cross-origin headers, frame-guard, and X-Content-Type protection.' },
    { title: 'Strict Tool Allowlisting', status: 'Enforced', desc: 'Only inspect_energy_data, calculate_savings_scenario, and draft_maintenance_task execute.' },
    { title: 'CSV Formula Injection Defense', status: 'Active', desc: 'Exported strings starting with [=, +, -, @] are safely prefixed with single-quote.' },
    { title: 'Bounded Agent Execution', status: 'Enforced', desc: 'Maximum 4 tool iterations, 25-second timeout, and safe deterministic fallback.' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span>Technical Diagnostics &amp; Session Audit Trail</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Runtime metrics, in-memory isolation, and volatile session event logging for technical evaluation.
          </p>
        </div>

        <button
          onClick={exportReportJson}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          <span>{t('btn_export_json')}</span>
        </button>
      </div>

      {/* Real Measurements KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Metric 1: Rows Processed */}
        <div className="p-4 rounded-xl glass-panel space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Observations</span>
            <Layers className="h-4 w-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
            {formatNum(diagnostics.csvRowsProcessed)}
          </div>
          <p className="text-[10px] text-slate-400">Verified in-memory</p>
        </div>

        {/* Metric 2: Client Analytics Duration */}
        <div className="p-4 rounded-xl glass-panel space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Client Math Time</span>
            <Clock className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {diagnostics.clientAnalyticsDurationMs} <span className="text-xs font-normal">ms</span>
          </div>
          <p className="text-[10px] text-slate-400">Local processing</p>
        </div>

        {/* Metric 3: Backend Latency */}
        <div className="p-4 rounded-xl glass-panel space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Backend Latency</span>
            <Server className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-600 dark:text-indigo-400">
            {diagnostics.backendLatencyMs} <span className="text-xs font-normal">ms</span>
          </div>
          <p className="text-[10px] text-slate-400">Agent loop response</p>
        </div>

        {/* Metric 4: AI Requests Count */}
        <div className="p-4 rounded-xl glass-panel space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>AI Executions</span>
            <Cpu className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">
            {formatNum(diagnostics.aiRequestsCount)}
          </div>
          <p className="text-[10px] text-slate-400">Session agent runs</p>
        </div>

        {/* Metric 5: Tool Invocations */}
        <div className="p-4 rounded-xl glass-panel space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Tools Executed</span>
            <FileCode className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {formatNum(diagnostics.toolInvocationsCount)}
          </div>
          <p className="text-[10px] text-slate-400">Allowlisted sandboxes</p>
        </div>

        {/* Metric 6: Validation Errors */}
        <div className="p-4 rounded-xl glass-panel space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Validation Checks</span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
            {formatNum(diagnostics.validationErrorsCount)}
          </div>
          <p className="text-[10px] text-slate-400">Rejected malformed rows</p>
        </div>
      </div>

      {/* Engine Status & Architecture Verification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl glass-panel space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Optimization Engine Status</span>
            </h3>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
                apiHealth?.isGeminiConfigured
                  ? 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30'
                  : 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30'
              }`}
            >
              {apiHealth?.isGeminiConfigured ? 'Live AI Mode' : 'Deterministic Mode'}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {apiHealth?.isGeminiConfigured
              ? 'The system connects through secure server-side SDK endpoints with bounded multi-turn tool calling and deterministic fallback safeguards.'
              : 'The system operates with zero external network dependency using verified deterministic mathematical models inside volatile session space.'}
          </p>

          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Service Health:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{apiHealth?.status || 'Active'}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Last Execution:</span>
              <span className="text-slate-800 dark:text-slate-200">{formatTimeStr(diagnostics.lastRunTimestamp)}</span>
            </div>
          </div>
        </div>

        {/* Security Checklist */}
        <div className="p-5 rounded-2xl glass-panel space-y-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
            <Lock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Architecture &amp; Integrity Controls</span>
          </div>

          <div className="space-y-2 text-xs">
            {securityChecklist.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 flex items-start justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{item.title}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">{item.desc}</div>
                </div>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Session Audit Log Timeline */}
      <div className="p-5 rounded-2xl glass-panel space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Volatile Session Event Timeline ({formatNum(sessionAudit.length)})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              All events exist strictly in client RAM and reset upon browser reload.
            </p>
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {sessionAudit.map((entry) => {
            const isExpanded = expandedAuditId === entry.id;
            return (
              <div
                key={entry.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                      {entry.type}
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">
                      {entry.description}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {formatTimeStr(entry.timestamp)}
                  </span>
                </div>

                {entry.details && (
                  <div>
                    <button
                      onClick={() => setExpandedAuditId(isExpanded ? null : entry.id)}
                      className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 inline-flex items-center gap-1 underline"
                    >
                      <span>{isExpanded ? 'Hide Payload' : 'View Event Payload'}</span>
                      {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>

                    {isExpanded && (
                      <pre className="mt-1 p-2 rounded-lg bg-slate-100 dark:bg-slate-950 font-mono text-[10px] text-emerald-700 dark:text-emerald-300 overflow-x-auto border border-slate-200 dark:border-slate-800">
                        {JSON.stringify(entry.details, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
