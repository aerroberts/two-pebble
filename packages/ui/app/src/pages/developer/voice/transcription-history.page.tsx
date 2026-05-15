import { Button, Header, PageLayout, RelativeTime, Section, Select, Surface } from '@two-pebble/components';
import {
  type ThreadSnapshotCellRecord,
  type ThreadSummaryRecord,
  useListThreads,
  useReadThreadSnapshot,
} from '@two-pebble/realtime';
import { useCallback, useEffect, useMemo, useState } from 'react';

type LoadStatus = 'loading' | 'ready' | 'error';

interface TranscriptionHistoryEntry {
  id: string;
  text: string;
  updatedAt: number;
}

const LIMIT_OPTIONS = [
  { label: 'Last 25', value: '25' },
  { label: 'Last 50', value: '50' },
  { label: 'Last 100', value: '100' },
  { label: 'Last 200', value: '200' },
];

export function TranscriptionHistoryPage() {
  const listThreads = useListThreads();
  const readThreadSnapshot = useReadThreadSnapshot();
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [limit, setLimit] = useState('50');
  const [entries, setEntries] = useState<TranscriptionHistoryEntry[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const numericLimit = useMemo(() => Number.parseInt(limit, 10), [limit]);

  const loadHistory = useCallback(async () => {
    setStatus('loading');
    try {
      const result = await listThreads();
      const voiceThreads = result.items
        .filter(isTranscriptionThread)
        .sort((left, right) => right.updatedAt - left.updatedAt)
        .slice(0, numericLimit);
      const nextEntries = await Promise.all(
        voiceThreads.map(async (thread) => {
          const snapshot = await readThreadSnapshot({ threadId: thread.threadId });
          return toHistoryEntry(thread, snapshot.items);
        }),
      );
      setEntries(nextEntries.filter((entry): entry is TranscriptionHistoryEntry => entry !== null));
      setStatus('ready');
    } catch {
      setEntries([]);
      setStatus('error');
    }
  }, [listThreads, numericLimit, readThreadSnapshot]);

  useEffect(() => {
    void loadHistory();
    const intervalId = window.setInterval(() => void loadHistory(), 5000);
    return () => window.clearInterval(intervalId);
  }, [loadHistory]);

  const copyText = async (entry: TranscriptionHistoryEntry) => {
    await navigator.clipboard.writeText(entry.text);
    setCopiedId(entry.id);
    window.setTimeout(() => setCopiedId((current) => (current === entry.id ? null : current)), 1200);
  };

  const emptyState =
    status === 'loading'
      ? 'Loading transcriptions.'
      : status === 'error'
        ? 'Could not load transcriptions.'
        : 'No transcriptions found.';

  return (
    <PageLayout width="fixed">
      <Header
        actionItems={
          <div className="flex items-center gap-2">
            <Select options={LIMIT_OPTIONS} value={limit} onChange={setLimit} />
            <Button onClick={() => void loadHistory()} type="button">
              Refresh
            </Button>
          </div>
        }
        subtitle="Recent speech-to-text results recorded by voice capture flows."
      >
        Transcription History
      </Header>
      <Section title="Recent transcriptions">
        {entries.length === 0 ? <Surface>{emptyState}</Surface> : null}
        <div className="flex flex-col gap-2">
          {entries.map((entry) => (
            <Surface key={entry.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 text-[12px] leading-4 text-content-muted">
                    <RelativeTime date={entry.updatedAt} hideIcon />
                  </div>
                  <p className="whitespace-pre-wrap break-words text-[13px] leading-5 text-content">{entry.text}</p>
                </div>
                <Button onClick={() => void copyText(entry)} type="button">
                  {copiedId === entry.id ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </Surface>
          ))}
        </div>
      </Section>
    </PageLayout>
  );
}

function isTranscriptionThread(thread: ThreadSummaryRecord): boolean {
  return thread.threadId.startsWith('voice-transcription-');
}

function toHistoryEntry(
  thread: ThreadSummaryRecord,
  cells: ThreadSnapshotCellRecord[],
): TranscriptionHistoryEntry | null {
  const transcriptCell = cells.find((cell) => cell.label === 'transcript') ?? cells.find((cell) => cell.role === 'assistant');
  const text = transcriptCell === undefined ? '' : extractText(transcriptCell.content);
  if (text.trim().length === 0) {
    return null;
  }
  return {
    id: thread.threadId,
    text,
    updatedAt: thread.updatedAt,
  };
}

function extractText(cells: unknown): string {
  if (!Array.isArray(cells)) {
    return '';
  }
  return cells
    .map((cell) => {
      if (!isRecord(cell) || cell.type !== 'text' || !isRecord(cell.content)) {
        return '';
      }
      const text = cell.content.text;
      return typeof text === 'string' ? text : '';
    })
    .filter((text) => text.length > 0)
    .join('\n');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
