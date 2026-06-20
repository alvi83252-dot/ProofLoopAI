export class FileParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FileParseError';
  }
}

export interface ParsedFileContent {
  text: string;
  warnings: string[];
  parser: 'pdf' | 'csv' | 'txt' | 'text-fallback';
}

function looksLikeText(buffer: Buffer): boolean {
  const sample = buffer.subarray(0, Math.min(buffer.length, 4096)).toString('utf-8');
  if (sample.length < 10) return false;
  const printable = sample.replace(/[\x09\x0a\x0d\x20-\x7e\u00a0-\uFFFF]/g, '').length;
  return printable / sample.length < 0.15;
}

function parseCsvToText(raw: string): string {
  const lines = raw.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length <= 1) return raw;

  const rows = lines.map((line) => {
    const cells: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') inQuotes = !inQuotes;
      else if (char === ',' && !inQuotes) {
        cells.push(current.trim());
        current = '';
      } else current += char;
    }
    cells.push(current.trim());
    return cells;
  });

  return rows
    .flatMap((cells) => cells.filter((c) => c.length > 20))
    .join('\n\n');
}

export async function parseFileContent(buffer: Buffer, fileName: string): Promise<ParsedFileContent> {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? 'txt';
  const warnings: string[] = [];

  if (ext === 'pdf') {
    try {
      const pdfParse = (await import('pdf-parse')).default;
      const parsed = await pdfParse(buffer);
      const text = parsed.text?.trim() ?? '';
      if (text.length >= 20) {
        return { text, warnings, parser: 'pdf' };
      }
      warnings.push('PDF contained very little extractable text — try a text-based PDF or paste content directly.');
      if (looksLikeText(buffer)) {
        return { text: buffer.toString('utf-8').trim(), warnings: [...warnings, 'Used plain-text fallback.'], parser: 'text-fallback' };
      }
      throw new FileParseError(
        `Could not extract text from "${fileName}". The PDF may be scanned/image-only. Export as .txt or paste the content on Proof Discovery.`
      );
    } catch (e) {
      if (e instanceof FileParseError) throw e;
      if (looksLikeText(buffer)) {
        return {
          text: buffer.toString('utf-8').trim(),
          warnings: [`PDF parser failed (${e instanceof Error ? e.message : 'invalid PDF'}) — read file as plain text instead.`],
          parser: 'text-fallback'
        };
      }
      throw new FileParseError(
        `Could not parse "${fileName}" as PDF. Use a .txt or .csv file, or paste your content directly.`
      );
    }
  }

  if (ext === 'csv') {
    const raw = buffer.toString('utf-8');
    const text = parseCsvToText(raw);
    if (text.trim().length < 10) {
      throw new FileParseError(`CSV file "${fileName}" appears empty or has no readable text columns.`);
    }
    return { text: text.trim(), warnings, parser: 'csv' };
  }

  if (ext === 'txt') {
    const text = buffer.toString('utf-8').trim();
    if (text.length < 10) {
      throw new FileParseError(`Text file "${fileName}" is too short or empty.`);
    }
    return { text, warnings, parser: 'txt' };
  }

  if (looksLikeText(buffer)) {
    return { text: buffer.toString('utf-8').trim(), warnings: [`Treated .${ext} as plain text.`], parser: 'text-fallback' };
  }

  throw new FileParseError(`Unsupported or unreadable file type ".${ext}". Upload PDF, CSV, or TXT.`);
}

export const ALLOWED_UPLOAD_EXTENSIONS = ['pdf', 'csv', 'txt'] as const;

export function validateUploadFile(fileName: string, sizeBytes: number): void {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (!ext || !ALLOWED_UPLOAD_EXTENSIONS.includes(ext as (typeof ALLOWED_UPLOAD_EXTENSIONS)[number])) {
    throw new FileParseError(`File type ".${ext ?? 'unknown'}" not supported. Use PDF, CSV, or TXT.`);
  }
  const maxBytes = 10 * 1024 * 1024;
  if (sizeBytes > maxBytes) {
    throw new FileParseError(`File too large (${(sizeBytes / 1024 / 1024).toFixed(1)}MB). Maximum size is 10MB.`);
  }
}
