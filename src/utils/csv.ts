/**
 * CSV yuklab berish. Ajratgich — ";" va boshida BOM: rus/o'zbek lokalidagi Excel ustunlarni
 * va kirill harflarini shunda to'g'ri ochadi.
 */
export function downloadCsv(fileName: string, header: string[], rows: (string | number)[][]): void {
  const escape = (value: string | number) => {
    const text = String(value);
    return /[";\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const body = [header, ...rows].map((row) => row.map(escape).join(";")).join("\r\n");
  const blob = new Blob(["﻿", body], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName.endsWith(".csv") ? fileName : `${fileName}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
