import { describe, it, expect } from 'vitest';
import { parseAndValidateCsv, sanitizeCsvExportField, sanitizeText } from '../utils/csvParser';

describe('CSV Parser & Validation Suite', () => {
  it('successfully parses valid campus energy CSV data', () => {
    const csv = [
      'timestamp,site,zone,kwh,occupancy',
      '2026-10-15T08:00:00Z,Main Campus,Engineering Hall,45.2,50',
      '2026-10-15T09:00:00Z,Main Campus,Engineering Hall,52.8,110',
    ].join('\n');

    const result = parseAndValidateCsv(csv);
    expect(result.success).toBe(true);
    expect(result.readings.length).toBe(2);
    expect(result.readings[0].zone).toBe('Engineering Hall');
    expect(result.readings[0].kwh).toBe(45.2);
    expect(result.readings[0].occupancy).toBe(50);
  });

  it('rejects CSV with missing required columns', () => {
    const csv = [
      'timestamp,site,zone',
      '2026-10-15T08:00:00Z,Main Campus,Engineering Hall',
    ].join('\n');

    const result = parseAndValidateCsv(csv);
    expect(result.success).toBe(false);
    expect(result.errors.some((e) => e.field === 'headers')).toBe(true);
  });

  it('detects and flags malformed timestamps without crashing', () => {
    const csv = [
      'timestamp,site,zone,kwh',
      'invalid-not-a-date,Main Campus,Library,22.4',
    ].join('\n');

    const result = parseAndValidateCsv(csv);
    expect(result.success).toBe(false);
    expect(result.errors.some((e) => e.field === 'timestamp')).toBe(true);
  });

  it('rejects negative or non-finite kWh readings', () => {
    const csv = [
      'timestamp,site,zone,kwh',
      '2026-10-15T08:00:00Z,Main Campus,Library,-15.5',
      '2026-10-15T09:00:00Z,Main Campus,Library,NaN',
    ].join('\n');

    const result = parseAndValidateCsv(csv);
    expect(result.success).toBe(false);
    expect(result.errors.some((e) => e.message.includes('Negative energy consumption'))).toBe(true);
    expect(result.errors.some((e) => e.message.includes('valid number'))).toBe(true);
  });

  it('handles completely empty input gracefully', () => {
    const result = parseAndValidateCsv('');
    expect(result.success).toBe(false);
    expect(result.errors[0].message).toContain('empty');
  });

  it('deduplicates identical timestamp and zone records', () => {
    const csv = [
      'timestamp,site,zone,kwh',
      '2026-10-15T08:00:00Z,Main Campus,Library,25.0',
      '2026-10-15T08:00:00Z,Main Campus,Library,25.0', // duplicate
    ].join('\n');

    const result = parseAndValidateCsv(csv);
    expect(result.success).toBe(true);
    expect(result.readings.length).toBe(1);
    expect(result.duplicateRowsCount).toBe(1);
  });

  describe('CSV Injection Defense', () => {
    it('sanitizes formula triggers by prepending single quote', () => {
      expect(sanitizeCsvExportField('=SUM(A1:A10)')).toBe("'=SUM(A1:A10)");
      expect(sanitizeCsvExportField('+12345')).toBe("'+12345");
      expect(sanitizeCsvExportField('-2+3')).toBe("'-2+3");
      expect(sanitizeCsvExportField('@cmd.exe')).toBe("'@cmd.exe");
    });

    it('safely handles normal text and escapes quotes', () => {
      expect(sanitizeCsvExportField('Standard Text')).toBe('Standard Text');
      expect(sanitizeCsvExportField('Text, with comma')).toBe('"Text, with comma"');
      expect(sanitizeCsvExportField('Text "with quotes"')).toBe('"Text ""with quotes"""');
    });
  });
});
