/**
 * Exports tabular data to CSV with UTF-8 BOM for Microsoft Excel compatibility in DR Congo / Francophone locales.
 */
export function exportToCsv<T extends Record<string, any>>(
  filename: string,
  rows: T[],
  columnHeaders: { key: keyof T; label: string }[]
) {
  if (!rows || rows.length === 0) return;

  const headerLine = columnHeaders.map((col) => `"${col.label.replace(/"/g, '""')}"`).join(';');

  const dataLines = rows.map((row) => {
    return columnHeaders
      .map((col) => {
        const val = row[col.key];
        const stringVal = val === null || val === undefined ? '' : String(val);
        return `"${stringVal.replace(/"/g, '""')}"`;
      })
      .join(';');
  });

  // UTF-8 BOM \uFEFF ensures Excel displays accents (é, è, à, etc.) properly
  const csvContent = '\uFEFF' + [headerLine, ...dataLines].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

