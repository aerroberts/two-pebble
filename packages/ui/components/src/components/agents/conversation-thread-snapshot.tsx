import { TraceRow } from './trace-row';
import type { TraceComponentProps } from './types';

export function ConversationThreadSnapshotTrace(props: TraceComponentProps<'conversation-thread-snapshot'>) {
  const threadCursor = props.trace.data.threadCursor;

  return (
    <TraceRow
      icon="FileCheck"
      onClick={
        props.onThreadSnapshotClick === undefined ? undefined : () => props.onThreadSnapshotClick?.(threadCursor)
      }
      timestamp={props.trace.createdAt}
      title={`Thread snapshot ${threadSnapshotOrdinal(threadCursor)}`}
    />
  );
}

function threadSnapshotOrdinal(threadCursor: string) {
  const separatorIndex = Math.max(threadCursor.lastIndexOf('/'), threadCursor.lastIndexOf(':'));

  if (separatorIndex < 0 || separatorIndex === threadCursor.length - 1) {
    return threadCursor;
  }

  return threadCursor.slice(separatorIndex + 1);
}
