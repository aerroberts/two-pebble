import { AgentTraceItem } from './agent-trace-item';
import type { TraceComponentProps } from './types';

export function DocumentCreatedTrace(props: TraceComponentProps<'document-created'>) {
  const { documentId, documentName } = props.trace.data;
  return (
    <AgentTraceItem
      icon="FileText"
      onClick={props.onDocumentClick === undefined ? undefined : () => props.onDocumentClick?.(documentId)}
      timestamp={props.trace.createdAt}
      title={`Created document: ${documentName}`}
      status="atomic"
    />
  );
}
