/** Remove junk quotes, duplicates, and low-quality extractions from signal lists */
export function cleanTrustSignals<T extends { quote: string; proofScore?: number }>(signals: T[]): T[] {
  const seen = new Set<string>();

  return signals
    .filter((s) => {
      const q = s.quote.trim();
      if (q.length < 20) return false;
      if (/^Subject:/i.test(q)) return false;
      if (/^@\{/.test(q) || /System\.Object/i.test(q)) return false;
      if (/^GUIDANCE INPUT/i.test(q)) return false;
      if (/^score,comment,type/i.test(q)) return false;

      const key = q.toLowerCase().replace(/\s+/g, ' ').slice(0, 100);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => (b.proofScore ?? 0) - (a.proofScore ?? 0));
}
