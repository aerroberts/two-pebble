import { Button, Header, ListLayout, PageLayout, RelativeTime } from '@two-pebble/components';
import { useDebugLogs, useOpenDebugLogsDirectory } from '@two-pebble/realtime';
import { useNavigate } from 'react-router-dom';

export function DaemonLogsPage() {
  const debugLogs = useDebugLogs();
  const navigate = useNavigate();
  const openLogsDirectory = useOpenDebugLogsDirectory();

  return (
    <PageLayout width="fixed">
      <Header
        actionItems={
          <Button leftIcon="folder-open" onClick={() => void openLogsDirectory()} type="button">
            Open logs dir
          </Button>
        }
        subtitle="The daemon writes its runtime logs to files on disk."
      >
        Daemon Logs
      </Header>
      <ListLayout
        emptyState={debugLogs.status === 'loading' ? 'Loading daemon logs.' : 'No daemon log files found.'}
        items={debugLogs.entries().map((log) => ({
          key: log.id,
          onClick: () => navigate(`/developer/daemon-logs/${log.id}`),
          title: log.value.name,
          value: <RelativeTime date={log.value.updatedAtIso} silent />,
        }))}
      />
    </PageLayout>
  );
}
