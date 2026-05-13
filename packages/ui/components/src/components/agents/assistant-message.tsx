import { MarkdownView } from '../code/markdown/markdown';
import { AgentTraceItem } from './agent-trace-item';
import { SpeakTextButton } from './speak-text-button';
import { renderCellInputForTrace } from './trace-utils/render-cell-input-for-trace';
import type { TraceComponentProps } from './types';

export function AssistantMessageTrace(props: TraceComponentProps<'assistant-message'>) {
  const content = stringifyTraceContent(renderCellInputForTrace(props.trace.data.content));

  return (
    <AgentTraceItem
      content={<MarkdownView content={content} />}
      icon="Bot"
      status="atomic"
      timestamp={props.trace.createdAt}
      title="Agent Message"
      titleAction={
        props.speakController === undefined ? undefined : (
          <SpeakTextButton text={content} controller={props.speakController} />
        )
      }
    />
  );
}

function stringifyTraceContent(value: unknown): string {
  return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
}
