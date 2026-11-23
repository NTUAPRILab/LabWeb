import type { NewsItem } from '../data';

const kindMap: Record<string, NewsItem['kind']> = {
  獲獎: 'award',
  award: 'award',
  榮譽: 'honor',
  honor: 'honor',
  校友: 'career',
  career: 'career',
  學術服務: 'service',
  service: 'service',
};

/** Parse RFC-4180 CSV text (handles quoted fields, escaped quotes, and CRLF/LF). */
export function parseCsv(csv: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;
  const text = csv.replace(/^\uFEFF/, '');

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\r' || ch === '\n') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      if (row.some((c) => c.trim() !== '')) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += ch;
    }
  }
  if (cell !== '' || row.length > 0) {
    row.push(cell);
    if (row.some((c) => c.trim() !== '')) rows.push(row);
  }
  return rows;
}

export async function fetchNewsFromSheet(url: string): Promise<{ year: string; items: NewsItem[] }[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const rows = parseCsv(await res.text());
  if (rows.length <= 1) return [];

  const grouped = new Map<string, NewsItem[]>();
  for (const [rawYear, rawKind, rawZh, rawEn] of rows.slice(1)) {
    const year = rawYear?.trim();
    const text = rawZh?.trim();
    if (!year || !text) continue;
    const kind = kindMap[rawKind?.trim().toLowerCase() ?? ''] ?? kindMap[rawKind?.trim() ?? ''] ?? 'award';
    const en = rawEn?.trim() || text;
    const list = grouped.get(year) ?? [];
    list.push({ kind, text, en });
    grouped.set(year, list);
  }

  return Array.from(grouped.entries())
    .sort(([a], [b]) => Number(b) - Number(a))
    .map(([year, items]) => ({ year, items }));
}
