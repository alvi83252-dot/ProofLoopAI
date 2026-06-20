const DEFAULT_CHUNK_SIZE = 500;
const DEFAULT_OVERLAP = 80;

export function chunkText(text: string, chunkSize = DEFAULT_CHUNK_SIZE, overlap = DEFAULT_OVERLAP): { text: string; index: number }[] {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (normalized.length <= chunkSize) {
    return [{ text: normalized, index: 0 }];
  }

  const chunks: { text: string; index: number }[] = [];
  let start = 0;
  let index = 0;

  while (start < normalized.length) {
    let end = Math.min(start + chunkSize, normalized.length);

    if (end < normalized.length) {
      const slice = normalized.slice(start, end);
      const breakAt = Math.max(slice.lastIndexOf('\n'), slice.lastIndexOf('. '));
      if (breakAt > chunkSize * 0.4) end = start + breakAt + 1;
    }

    const chunk = normalized.slice(start, end).trim();
    if (chunk.length > 0) chunks.push({ text: chunk, index });

    if (end >= normalized.length) break;
    start = Math.max(end - overlap, start + 1);
    index++;
  }

  return chunks;
}

export function chunkConversation(title: string, text: string): { text: string; index: number }[] {
  const header = `[${title}]\n`;
  return chunkText(header + text);
}
