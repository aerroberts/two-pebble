import { Header, ListLayout, PageLayout, RelativeTime, Section } from '@two-pebble/components';
import { type ThreadSummaryRecord, useListThreads } from '@two-pebble/realtime';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type LoadStatus = 'loading' | 'ready' | 'error';

export function ThreadsPage() {
  const listThreads = useListThreads();
  const navigate = useNavigate();
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [threads, setThreads] = useState<ThreadSummaryRecord[]>([]);

  useEffect(() => {
    setStatus('loading');
    let cancelled = false;
    void listThreads()
      .then((result) => {
        if (cancelled) return;
        setThreads(result.items);
        setStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setThreads([]);
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [listThreads]);

  const { tracingThreads, otherThreads } = useMemo(() => {
    const tracing: ThreadSummaryRecord[] = [];
    const other: ThreadSummaryRecord[] = [];
    for (const thread of threads) {
      if (thread.agentIds.length > 0) tracing.push(thread);
      else other.push(thread);
    }
    return { tracingThreads: tracing, otherThreads: other };
  }, [threads]);

  const renderItems = (rows: ThreadSummaryRecord[]) =>
    rows.map((thread) => ({
      key: thread.threadId,
      onClick: () => navigate(`/developer/threads/${encodeURIComponent(thread.threadId)}`),
      subtitle: formatThreadSubtitle(thread),
      title: thread.threadId,
      value: <RelativeTime date={thread.updatedAt} silent />,
    }));

  const baseEmpty =
    status === 'loading' ? 'Loading threads.' : status === 'error' ? 'Could not load threads.' : 'No threads found.';

  return (
    <PageLayout width="fixed">
      <Header subtitle="Every conversation thread persisted in the local datastore.">Threads</Header>
      <Section title="Tracing" subtitle="Threads attached to one or more agent runs.">
        <ListLayout
          emptyState={status === 'ready' ? 'No tracing threads.' : baseEmpty}
          items={renderItems(tracingThreads)}
        />
      </Section>
      <Section title="Other" subtitle="Threads without an attached agent (logs, database, ad hoc).">
        <ListLayout
          emptyState={status === 'ready' ? 'No other threads.' : baseEmpty}
          items={renderItems(otherThreads)}
        />
      </Section>
    </PageLayout>
  );
}

function formatThreadSubtitle(thread: ThreadSummaryRecord): string {
  const cellLabel = `${thread.cellCount} cell${thread.cellCount === 1 ? '' : 's'}`;
  if (thread.agentIds.length === 0) {
    return cellLabel;
  }
  const agentLabel = `${thread.agentIds.length} agent${thread.agentIds.length === 1 ? '' : 's'}`;
  return `${cellLabel} • ${agentLabel}`;
}
