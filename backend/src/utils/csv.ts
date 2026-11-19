import type { Response } from 'express';

export interface CsvColumn<T> { header: string; value: (row: T) => unknown }

/**
 * CSV that opens correctly in Excel (UTF-8 byte-order mark, CRLF line endings, quoted cells).
 * Cells that a spreadsheet would treat as a formula (=, +, -, @, tab, CR) are prefixed with an apostrophe
 * so exported submissions cannot run formulas on the reader's machine (CSV injection).
 */
export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const cell = (v: unknown) => {
    let s = v === null || v === undefined ? '' : v instanceof Date ? v.toISOString().replace('T', ' ').slice(0, 19) : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [columns.map((c) => cell(c.header)).join(','), ...rows.map((r) => columns.map((c) => cell(c.value(r))).join(','))];
  return '﻿' + lines.join('\r\n') + '\r\n';
}

export function sendCsv(res: Response, filename: string, csv: string) {
  res.set({
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  res.send(csv);
}
