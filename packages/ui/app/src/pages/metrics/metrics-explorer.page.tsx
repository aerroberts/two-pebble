import { Header, ListLayout, PageLayout, RelativeTime } from '@two-pebble/components';
import type { MetricNameSummary } from '@two-pebble/protocol';
import { useRealtimeDatastore } from '@two-pebble/realtime';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

export function MetricsExplorerPage() {
  const datastore = useRealtimeDatastore();
  const navigate = useNavigate();
  const [items, setItems] = useState<MetricNameSummary[]>([]);
  const [status, setStatus] = useState<LoadStatus>('idle');

  useEffect(() => {
    let active = true;
    setStatus('loading');
    void datastore.metrics
      .listNames()
      .then((result) => {
        if (active) {
          setItems(result.items);
          setStatus('ready');
        }
      })
      .catch(() => {
        if (active) setStatus('error');
      });
    return () => {
      active = false;
    };
  }, [datastore]);

  const emptyState =
    status === 'loading'
      ? 'Loading metric names.'
      : status === 'error'
        ? 'Failed to load metric names.'
        : 'No metrics emitted yet.';

  return (
    <PageLayout width="fixed">
      <Header subtitle="Internal metrics emitted by the daemon and datastore. Click a metric to chart it.">
        Metrics Explorer
      </Header>
      <ListLayout
        emptyState={emptyState}
        items={items.map((item) => ({
          key: item.name,
          onClick: () => navigate(`/metrics/${encodeURIComponent(item.name)}`),
          title: item.name,
          subtitle: `${item.sampleCount.toLocaleString()} samples`,
          value: <RelativeTime date={new Date(item.lastSeenAt).toISOString()} silent />,
        }))}
      />
    </PageLayout>
  );
}
