'use client';

import { useEffect, useState } from 'react';
import { api, type TrustSignal, type ProofSource, type DiscoveryRagMeta, type UploadFileMeta } from '@/lib/api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ScoreRing } from '@/components/ui/ScoreRing';

function sourceBadge(source: string) {
  if (source === 'demo-data') return { label: 'Demo source', className: 'bg-violet-500/20 text-violet-300' };
  if (source === 'demo-guidance') return { label: 'Guidance', className: 'bg-fuchsia-500/20 text-fuchsia-300' };
  if (source.startsWith('upload-')) return { label: 'Your upload', className: 'bg-sky-500/20 text-sky-300' };
  if (source === 'unify-conversations') return { label: 'Unify', className: 'bg-emerald-500/20 text-emerald-300' };
  return { label: source, className: 'bg-secondary text-muted-foreground' };
}

function DiscoverySummary({ rag, signalCount }: { rag: DiscoveryRagMeta; signalCount: number }) {
  const [showSources, setShowSources] = useState(false);

  const modeLabel =
    rag.mode === 'demo'
      ? 'Scanned built-in sample data'
      : rag.indexedChunks > 0
        ? 'Analyzed your content with smart matching'
        : 'Analyzed pasted content';

  return (
    <Card className="space-y-4 border-emerald-500/20 bg-emerald-500/5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-lg">Discovery Summary</h2>
          <p className="text-sm text-muted-foreground mt-1">{modeLabel}</p>
        </div>
        <Badge className="bg-emerald-500/20 text-emerald-400">{signalCount} signal{signalCount !== 1 ? 's' : ''} found</Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Smart match" value={rag.ragUsed ? 'Active' : 'Off'} highlight={rag.ragUsed} />
        <Stat label="Sample match" value={rag.demoDataMatched ? 'Yes' : 'No'} highlight={rag.demoDataMatched} />
        <Stat label="Sources used" value={String(rag.chunksRetrieved)} />
        <Stat label="New content" value={rag.indexedChunks > 0 ? String(rag.indexedChunks) : '—'} />
      </div>

      {rag.chunks.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowSources((v) => !v)}
            className="flex w-full items-center justify-between rounded-lg border border-border bg-card/50 px-4 py-2.5 text-sm text-foreground hover:bg-muted/40 transition-colors"
          >
            <span>{showSources ? 'Hide' : 'Show'} related sources ({rag.chunks.length})</span>
            <span className="text-muted-foreground">{showSources ? '▲' : '▼'}</span>
          </button>

          {showSources && (
            <div className="mt-3 space-y-2">
              {rag.chunks.map((chunk) => {
                const badge = sourceBadge(chunk.source);
                const preview = chunk.text.replace(/\s+/g, ' ').slice(0, 140);
                return (
                  <div key={chunk.id} className="rounded-lg border border-border bg-card p-3">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-sm font-medium text-foreground">{chunk.title}</span>
                      <Badge className={badge.className}>{badge.label}</Badge>
                      <span className="text-xs text-muted-foreground ml-auto">{Math.round(chunk.score * 100)}% match</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{preview}{chunk.text.length > 140 ? '…' : ''}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-card/60 px-3 py-2.5 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-sm font-semibold mt-0.5 ${highlight ? 'text-emerald-400' : 'text-foreground'}`}>{value}</p>
    </div>
  );
}

export default function DiscoveryPage() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TrustSignal[]>([]);
  const [sources, setSources] = useState<ProofSource[]>([]);
  const [samples, setSamples] = useState<{ id: string; name: string; type: string; content: string }[]>([]);
  const [supported, setSupported] = useState<{ uploads: Record<string, { ext: string; description: string }>; pasteTypes: string[] } | null>(null);
  const [ragMeta, setRagMeta] = useState<DiscoveryRagMeta | null>(null);
  const [lastMode, setLastMode] = useState<'demo' | 'paste' | null>(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadedFile, setUploadedFile] = useState<UploadFileMeta | null>(null);
  const [uploadWarnings, setUploadWarnings] = useState<string[]>([]);

  const hasPaste = content.trim().length > 0;

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  function fileIcon(name: string) {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📄';
    if (ext === 'csv') return '📊';
    return '📝';
  }

  useEffect(() => {
    api.getSources().then(setSources).catch(() => {});
    api.getSampleDatasets().then(setSamples).catch(() => {});
    api.getSupportedTypes().then(setSupported).catch(() => {});
  }, []);

  async function processResponse(res: { signals: TrustSignal[]; rag?: DiscoveryRagMeta }, mode: 'demo' | 'paste') {
    setResults(res.signals);
    setRagMeta(res.rag ?? null);
    setLastMode(mode);
    setSources(await api.getSources());
  }

  async function handleDiscover(text?: string, sampleTitle?: string) {
    const body = text ?? content;
    setLoading(true);
    setError('');
    try {
      if (body.trim()) {
        const res = await api.submitText(body, sampleTitle ?? (title || 'Pasted Content'));
        await processResponse(res, 'paste');
        if (!text) { setContent(''); setTitle(''); }
      } else {
        const res = await api.discoverDemo();
        await processResponse(res, 'demo');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to process');
    } finally {
      setLoading(false);
    }
  }

  async function handleFileUpload(file: File) {
    setSelectedFile(file);
    setUploadStatus('uploading');
    setLoading(true);
    setError('');
    setUploadWarnings([]);
    setUploadedFile(null);
    try {
      const res = await api.uploadFile(file);
      await processResponse(res, 'paste');
      setUploadedFile(res.file ?? { name: file.name, size: file.size, parser: 'unknown' });
      setUploadWarnings(res.warnings ?? []);
      setUploadStatus('success');
    } catch (e) {
      setUploadStatus('error');
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  function clearSelectedFile() {
    setSelectedFile(null);
    setUploadStatus('idle');
    setUploadedFile(null);
    setUploadWarnings([]);
    setError('');
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Proof Discovery</h1>
        <p className="text-muted-foreground mt-2">
          Upload documents, paste text, or hit Discover with an empty box to scan built-in sample data.
        </p>
      </div>

      {supported && (
        <Card className="border-primary/30 bg-primary/5 space-y-3">
          <Badge className="bg-primary/20 text-primary">Smart Discovery Active</Badge>
          <p className="text-sm text-muted-foreground">
            Upload or paste customer content to find trust signals. No input? We scan built-in sample data automatically.
          </p>
          <div className="grid gap-3 md:grid-cols-3">
            {Object.entries(supported.uploads).map(([key, val]) => (
              <div key={key} className="rounded-lg bg-muted/30 p-3 text-xs">
                <p className="font-semibold text-primary uppercase">{key} {val.ext}</p>
                <p className="text-muted-foreground mt-1">{val.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <h2 className="font-semibold text-lg">Upload Files</h2>

          {selectedFile && (
            <div className={`rounded-xl border p-4 transition-all ${
              uploadStatus === 'success' ? 'border-emerald-500/50 bg-emerald-500/10' :
              uploadStatus === 'error' ? 'border-red-500/50 bg-red-500/10' :
              uploadStatus === 'uploading' ? 'border-primary/50 bg-primary/10 animate-pulse' :
              'border-border bg-muted/30'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{fileIcon(selectedFile.name)}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                </div>
                {uploadStatus === 'uploading' && <Badge className="bg-primary/20 text-primary">Processing...</Badge>}
                {uploadStatus === 'success' && <Badge className="bg-emerald-500/20 text-emerald-400">✓ Uploaded</Badge>}
                {uploadStatus === 'error' && <Badge className="bg-red-500/20 text-red-400">Failed</Badge>}
                <button onClick={clearSelectedFile} className="text-muted-foreground hover:text-foreground text-xs px-2">✕</button>
              </div>
              {uploadedFile && uploadStatus === 'success' && (
                <p className="text-xs text-emerald-400 mt-2">
                  Parsed as {uploadedFile.parser.toUpperCase()} · {results.length} trust signal{results.length !== 1 ? 's' : ''} found
                </p>
              )}
              {uploadWarnings.length > 0 && (
                <div className="mt-2 space-y-1">
                  {uploadWarnings.map((w) => (
                    <p key={w} className="text-xs text-amber-400">⚠ {w}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          <div
            className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
              dragOver ? 'border-primary bg-primary/10 scale-[1.02]' :
              uploadStatus === 'uploading' ? 'border-primary/50 opacity-60 pointer-events-none' :
              'border-border hover:border-primary/50'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const f = e.dataTransfer.files[0];
              if (f) handleFileUpload(f);
            }}
          >
            {uploadStatus === 'uploading' ? (
              <div className="space-y-3">
                <div className="mx-auto h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-sm text-primary font-medium">Analyzing your document…</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">Drag & drop PDF, CSV, or TXT here</p>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.csv,.txt"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileUpload(f);
                      e.target.value = '';
                    }}
                  />
                  <span className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                    Choose File
                  </span>
                </label>
              </>
            )}
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="font-semibold text-lg">Paste Content</h2>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional)"
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste testimonials, emails, sales transcripts… or leave empty to scan demo data"
            rows={6}
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />

          {!hasPaste && (
            <div className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-xs text-violet-200">
              No text needed — click Discover to scan built-in sample customer proof.
            </div>
          )}

          <Button onClick={() => handleDiscover()} disabled={loading} className="w-full sm:w-auto">
            {loading
              ? 'Discovering...'
              : hasPaste
                ? 'Discover Proof'
                : 'Discover from Demo Data'}
          </Button>
        </Card>
      </div>

      {error && <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-400">{error}</div>}

      {results.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold text-lg">Discovered Signals ({results.length})</h2>
            {lastMode === 'demo' && (
              <Badge className="bg-violet-500/20 text-violet-300">From sample data</Badge>
            )}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {results.map((signal) => (
              <Card key={signal.id} hover className="flex gap-4">
                <ScoreRing score={signal.proofScore} size="sm" label="" />
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge className="bg-primary/20 text-primary border-primary/30">{signal.signalType}</Badge>
                    <Badge className="bg-secondary text-secondary-foreground">{signal.category}</Badge>
                  </div>
                  <p className="text-sm italic leading-relaxed">&ldquo;{signal.quote}&rdquo;</p>
                  <a href="/validation" className="text-xs text-orange-400 hover:underline mt-2 inline-block">
                    Validate on social media with Faxxing →
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      {results.length === 0 && ragMeta && lastMode === 'demo' && (
        <Card className="border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-200">
          Demo scan completed but no trust signals matched. Try a sample dataset below or paste customer text.
        </Card>
      )}

      {ragMeta && <DiscoverySummary rag={ragMeta} signalCount={results.length} />}

      <section>
        <h2 className="font-semibold text-lg mb-4">Sample Datasets</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {samples.map((sample) => (
            <Card key={sample.id} hover className="cursor-pointer" onClick={() => handleDiscover(sample.content, sample.name)}>
              <Badge className="bg-secondary text-secondary-foreground mb-2">{sample.type}</Badge>
              <p className="font-medium text-sm">{sample.name}</p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{sample.content.slice(0, 80)}…</p>
            </Card>
          ))}
        </div>
      </section>

      {sources.length > 0 && (
        <section>
          <h2 className="font-semibold text-lg mb-4">Recent Sources</h2>
          <div className="space-y-2">
            {sources.slice(0, 8).map((source) => (
              <Card key={source.id} className="flex items-center justify-between py-3 px-4">
                <div>
                  <p className="font-medium text-sm">{source.title}</p>
                  <p className="text-xs text-muted-foreground">{source.type} · {source.status}</p>
                </div>
                <Badge className={source.status === 'processed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}>
                  {source.status}
                </Badge>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
