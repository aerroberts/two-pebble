import { AgentTraceItem } from './agent-trace-item';
import type { TraceComponentProps } from './types';

export function DocumentUpdatedTrace(props: TraceComponentProps<'document-updated'>) {
  const { documentId, documentName } = props.trace.data;
  return (
    <AgentTraceItem
      icon="FilePen"
      onClick={props.onDocumentClick === undefined ? undefined : () => props.onDocumentClick?.(documentId)}
      timestamp={props.trace.createdAt}
      title={`Updated document: ${documentName}`}
      status="atomic"
    />
  );
}
