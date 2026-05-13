import { MarkdownView } from '../code/markdown/markdown';
import { AgentTraceItem } from './agent-trace-item';
import { renderCellInputForTrace } from './trace-utils/render-cell-input-for-trace';
import type { TraceComponentProps } from './types';

export function AgentFailureTrace(props: TraceComponentProps<'agent-failure'>) {
  const content = stringifyTraceContent(renderCellInputForTrace(props.trace.data.content));

  return (
    <AgentTraceItem
      content={<MarkdownView content={content} />}
      icon="CircleX"
      status="error"
      timestamp={props.trace.createdAt}
      title="Agent failed"
    />
  );
}

function stringifyTraceContent(value: unknown): string {
  return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
}
