import Papa from 'papaparse';
import { EnergyReading } from '../types/energy';

export interface CsvValidationError {
  row: number;
  field: string;
  message: string;
  value?: string;
}

export interface CsvParseResult {
  success: boolean;
  readings: EnergyReading[];
  errors: CsvValidationError[];
  totalRowsProcessed: number;
  duplicateRowsCount: number;
  warnings: string[];
}

const MAX_ROWS = 15000;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Sanitizes input text against formula injection and control characters
 */
export function sanitizeText(input: unknown): string {
  if (typeof input !== 'string') return String(input ?? '').trim();
  const trimmed = input.trim();
  // Strip control chars
  return trimmed.replace(/[\x00-\x1F\x7F]/g, '');
}

/**
 * Sanitizes field for CSV export to protect against spreadsheet formula injection (CSV injection)
 */
export function sanitizeCsvExportField(value: unknown): string {
  if (value === null || value === undefined) return '';
  let str = String(value);

  // If string begins with dangerous spreadsheet execution symbols, prefix with single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape quotes if needed
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Parses and strictly validates energy readings from CSV string content
 */
export function parseAndValidateCsv(csvContent: string): CsvParseResult {
  const errors: CsvValidationError[] = [];
  const warnings: string[] = [];
  const readings: EnergyReading[] = [];
  const seenRecordKeys = new Set<string>();
  let duplicateRowsCount = 0;

  if (!csvContent || !csvContent.trim()) {
    return {
      success: false,
      readings: [],
      errors: [{ row: 0, field: 'file', message: 'The uploaded CSV file is empty.' }],
      totalRowsProcessed: 0,
      duplicateRowsCount: 0,
      warnings: [],
    };
  }

  const parsed = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  if (parsed.errors && parsed.errors.length > 0) {
    for (const err of parsed.errors) {
      errors.push({
        row: (err.row ?? 0) + 1,
        field: 'csv_syntax',
        message: err.message,
      });
    }
  }

  const headers = parsed.meta.fields || [];
  const requiredHeaders = ['timestamp', 'site', 'zone', 'kwh'];
  const missingHeaders = requiredHeaders.filter((req) => !headers.includes(req));

  if (missingHeaders.length > 0) {
    return {
      success: false,
      readings: [],
      errors: [
        {
          row: 1,
          field: 'headers',
          message: `Missing required column(s): ${missingHeaders.join(', ')}. Expected: timestamp, site, zone, kwh, [occupancy].`,
        },
      ],
      totalRowsProcessed: 0,
      duplicateRowsCount: 0,
      warnings: [],
    };
  }

  if (parsed.data.length > MAX_ROWS) {
    warnings.push(`File exceeds ${MAX_ROWS} rows. Only the first ${MAX_ROWS} valid readings will be analyzed.`);
  }

  const dataRows = parsed.data.slice(0, MAX_ROWS);

  for (let idx = 0; idx < dataRows.length; idx++) {
    const rowNum = idx + 2; // Row 1 is header
    const raw = dataRows[idx];

    // Timestamp check
    const rawTimestamp = sanitizeText(raw.timestamp);
    if (!rawTimestamp) {
      errors.push({ row: rowNum, field: 'timestamp', message: 'Missing timestamp.' });
      continue;
    }
    const parsedDate = new Date(rawTimestamp);
    if (isNaN(parsedDate.getTime())) {
      errors.push({
        row: rowNum,
        field: 'timestamp',
        message: `Invalid timestamp format "${rawTimestamp}". Use ISO-8601 (YYYY-MM-DDTHH:mm:ss) or standard YYYY-MM-DD HH:mm:ss.`,
        value: rawTimestamp,
      });
      continue;
    }

    // Site & Zone check
    const site = sanitizeText(raw.site);
    const zone = sanitizeText(raw.zone);
    if (!site) {
      errors.push({ row: rowNum, field: 'site', message: 'Site name cannot be empty.' });
      continue;
    }
    if (!zone) {
      errors.push({ row: rowNum, field: 'zone', message: 'Zone name cannot be empty.' });
      continue;
    }

    // kWh validation
    const rawKwh = raw.kwh?.trim();
    if (rawKwh === undefined || rawKwh === '') {
      errors.push({ row: rowNum, field: 'kwh', message: 'Missing kWh reading value.' });
      continue;
    }
    const kwh = Number(rawKwh);
    if (isNaN(kwh) || !isFinite(kwh)) {
      errors.push({
        row: rowNum,
        field: 'kwh',
        message: `kWh reading must be a valid number, received: "${rawKwh}".`,
        value: rawKwh,
      });
      continue;
    }
    if (kwh < 0) {
      errors.push({
        row: rowNum,
        field: 'kwh',
        message: `Negative energy consumption (${kwh} kWh) is not permitted.`,
        value: rawKwh,
      });
      continue;
    }

    // Optional occupancy check
    let occupancy: number | undefined = undefined;
    if (raw.occupancy !== undefined && raw.occupancy !== null && raw.occupancy.trim() !== '') {
      const parsedOcc = Number(raw.occupancy.trim());
      if (isNaN(parsedOcc) || !isFinite(parsedOcc) || parsedOcc < 0) {
        errors.push({
          row: rowNum,
          field: 'occupancy',
          message: `Occupancy must be a non-negative number if provided, received: "${raw.occupancy}".`,
          value: raw.occupancy,
        });
        continue;
      }
      occupancy = Math.round(parsedOcc);
    }

    // Duplicate key check: zone + normalized timestamp
    const recordKey = `${zone.toLowerCase()}__${parsedDate.toISOString()}`;
    if (seenRecordKeys.has(recordKey)) {
      duplicateRowsCount++;
      // We skip duplicate timestamp for same zone to protect metric integrity
      continue;
    }
    seenRecordKeys.add(recordKey);

    readings.push({
      timestamp: parsedDate.toISOString(),
      site,
      zone,
      kwh,
      occupancy,
    });
  }

  if (duplicateRowsCount > 0) {
    warnings.push(`Ignored ${duplicateRowsCount} duplicate readings sharing the same zone and timestamp.`);
  }

  if (readings.length === 0 && errors.length === 0) {
    errors.push({
      row: 0,
      field: 'data',
      message: 'No valid data rows found in the uploaded file.',
    });
  }

  return {
    success: errors.length === 0 && readings.length > 0,
    readings,
    errors,
    totalRowsProcessed: dataRows.length,
    duplicateRowsCount,
    warnings,
  };
}

/**
 * Generates sample CSV template string
 */
export function generateSampleCsvTemplate(): string {
  return [
    'timestamp,site,zone,kwh,occupancy',
    '2026-10-15T08:00:00Z,Main Campus,Engineering Hall,45.2,65',
    '2026-10-15T09:00:00Z,Main Campus,Engineering Hall,52.8,110',
    '2026-10-15T10:00:00Z,Main Campus,Engineering Hall,61.4,145',
    '2026-10-15T02:00:00Z,Main Campus,Library,18.4,0',
    '2026-10-15T03:00:00Z,Main Campus,Library,17.9,0',
    '2026-10-15T14:00:00Z,Main Campus,Science Complex,88.5,80',
  ].join('\n');
}
