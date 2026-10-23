import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Download,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  FileCheck,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { generateSampleCsvTemplate } from '../../utils/csvParser';
import { ConfirmationModal } from '../ConfirmationModal';

export const DataImportTab: React.FC = () => {
  const {
    readings,
    analytics,
    isDemoData,
    csvValidationErrors,
    csvWarnings,
    handleCsvUpload,
    loadDemoData,
    clearSessionData,
    isAnalyzing,
    t,
    formatNum,
    formatDateStr,
    formatKwhNum,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showClearModal, setShowClearModal] = useState(false);
  const PAGE_SIZE = 20;

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert('File exceeds 5MB size limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      handleCsvUpload(text, file.name);
    };
    reader.readAsText(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const downloadSampleTemplate = () => {
    const csv = generateSampleCsvTemplate();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wattwise-sample-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered readings for table
  const filteredReadings = readings.filter((r) => {
    const matchesSearch =
      r.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.timestamp.includes(searchTerm) ||
      (r.site && r.site.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesZone = selectedZoneFilter === 'all' || r.zone === selectedZoneFilter;
    return matchesSearch && matchesZone;
  });

  const totalPages = Math.ceil(filteredReadings.length / PAGE_SIZE) || 1;
  const paginatedReadings = filteredReadings.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span>{t('import_title')}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t('import_subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={downloadSampleTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors shadow-sm"
          >
            <Download className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t('btn_download_template')}</span>
          </button>

          <button
            onClick={() => setShowClearModal(true)}
            disabled={readings.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-slate-300 dark:border-slate-700 hover:border-rose-400 transition-colors disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{t('btn_clear_session_data')}</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-8 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-emerald-500 bg-emerald-500/10'
            : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500/60 bg-white/60 dark:bg-slate-900/40 hover:bg-emerald-500/5'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={onFileInputChange}
          className="hidden"
        />

        <div className="max-w-md mx-auto space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <UploadCloud className="h-6 w-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {t('import_drag_title')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('import_drag_subtitle')}
            </p>
          </div>

          <div className="pt-2">
            <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors">
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>{t('import_or_browse')}</span>
            </span>
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            CSV files only • UTF-8 encoded • Strictly zero cloud retention
          </p>
        </div>
      </div>

      {/* Validation Errors & Warnings Alert */}
      {csvValidationErrors.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs">
            <AlertCircle className="h-4 w-4" />
            <span>{t('import_errors_found', { count: csvValidationErrors.length })}</span>
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1 text-[11px] text-rose-700 dark:text-rose-300 font-mono">
            {csvValidationErrors.slice(0, 10).map((err, idx) => (
              <div key={idx}>
                Row {err.row} [{err.field}]: {err.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {csvWarnings.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
            <AlertCircle className="h-4 w-4" />
            <span>{t('import_warnings_found', { count: csvWarnings.length })}</span>
          </div>
          <div className="space-y-0.5 text-[11px] text-amber-700 dark:text-amber-300">
            {csvWarnings.map((w, idx) => (
              <div key={idx}>{w}</div>
            ))}
          </div>
        </div>
      )}

      {/* Column Guidelines Card */}
      <div className="p-4 rounded-xl glass-panel space-y-1.5">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <FileCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>{t('import_format_guide_title')}</span>
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('import_required_cols')}
        </p>
      </div>

      {/* Data Table Preview */}
      {readings.length > 0 && (
        <div className="p-5 rounded-2xl glass-panel space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Loaded Session Observations ({formatNum(filteredReadings.length)})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                In-memory telemetry verified for statistical baseline analysis.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" aria-hidden="true" />
                <input
                  type="text"
                  aria-label="Search telemetry by zone or timestamp"
                  placeholder="Search zone or timestamp..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-8 pr-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                />
              </div>

              {/* Zone Filter */}
              {analytics && (
                <select
                  aria-label="Filter telemetry by facility"
                  value={selectedZoneFilter}
                  onChange={(e) => {
                    setSelectedZoneFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  <option value="all">All Facilities ({analytics.zones.length})</option>
                  {analytics.zones.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs" aria-label="Imported Campus Energy Telemetry Table">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 uppercase text-[10px] tracking-wider font-semibold">
                <tr>
                  <th scope="col" className="px-4 py-3">Timestamp</th>
                  <th scope="col" className="px-4 py-3">Zone / Building</th>
                  <th scope="col" className="px-4 py-3">Campus Site</th>
                  <th scope="col" className="px-4 py-3">Measured kWh</th>
                  <th scope="col" className="px-4 py-3">Occupancy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300 font-mono">
                {paginatedReadings.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-2.5 whitespace-nowrap text-slate-500 font-sans">
                      {formatDateStr(r.timestamp)}
                    </td>
                    <td className="px-4 py-2.5 font-sans font-semibold text-slate-900 dark:text-slate-100">
                      {r.zone}
                    </td>
                    <td className="px-4 py-2.5 font-sans text-slate-500">{r.site || 'Main Campus'}</td>
                    <td className="px-4 py-2.5 font-bold text-emerald-600 dark:text-emerald-400">
                      {formatNum(r.kwh, 2, 2)}
                    </td>
                    <td className="px-4 py-2.5 text-slate-500">
                      {r.occupancy !== undefined ? `${r.occupancy}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2">
            <span>
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, filteredReadings.length)} of{' '}
              {formatNum(filteredReadings.length)}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-2 font-mono">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showClearModal}
        title={t('modal_confirm_title')}
        message={t('modal_confirm_clear_desc')}
        isDestructive={true}
        onConfirm={() => {
          clearSessionData();
          setShowClearModal(false);
        }}
        onCancel={() => setShowClearModal(false)}
      />
    </div>
  );
};
