import { MarkdownView } from '../code/markdown/markdown';
import { AgentTraceItem } from './agent-trace-item';
import { renderCellInputForTrace } from './trace-utils/render-cell-input-for-trace';
import type { TraceComponentProps } from './types';

export function AssistantThinkingTrace(props: TraceComponentProps<'assistant-thinking'>) {
  const content = stringifyTraceContent(renderCellInputForTrace(props.trace.data.content));

  return (
    <AgentTraceItem
      content={<MarkdownView content={content} />}
      icon="Brain"
      status="atomic"
      timestamp={props.trace.createdAt}
      title="Agent Thinking"
    />
  );
}

function stringifyTraceContent(value: unknown): string {
  return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
}
