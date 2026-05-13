import { Button, CodeBlock, Header, PageLayout, Section, Surface } from '@two-pebble/components';
import { useDebugLogContent, useOpenDebugLog } from '@two-pebble/realtime';
import { Navigate, useParams } from 'react-router-dom';

export function DaemonLogPage() {
  const openDebugLog = useOpenDebugLog();
  const params = useParams();
  const logId = params.logId ?? '';
  const { log, status } = useDebugLogContent(logId);
  const subtitle =
    log === null
      ? `Viewing ${logId}. The daemon writes this runtime log to a file on disk.`
      : `Viewing ${log.name}. The daemon writes this runtime log to a file on disk.`;

  const handleOpenLog = () => {
    if (log !== null) {
      void openDebugLog({ id: log.id });
    }
  };

  if (logId.length === 0) {
    return <Navigate to="/developer/daemon-logs" replace />;
  }

  return (
    <PageLayout width="fixed">
      <Header
        actionItems={
          log === null ? null : (
            <Button leftIcon="folder-open" onClick={handleOpenLog} type="button">
              Open on disk
            </Button>
          )
        }
        subtitle={subtitle}
      >
        Daemon Logs
      </Header>
      <Section>
        {status === 'loading' ? <Surface>Loading log.</Surface> : null}
        {status === 'error' ? <Surface>Could not load debug log.</Surface> : null}
        {log === null ? null : <CodeBlock content={log.content} indentWrappedLines language="log" title="Log output" />}
      </Section>
    </PageLayout>
  );
}
