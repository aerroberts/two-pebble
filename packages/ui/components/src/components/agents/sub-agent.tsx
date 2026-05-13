import { Icon } from '../content/icon/icon';
import { AgentTraceItem, type AgentTraceItemStatus } from './agent-trace-item';
import { TraceBodyCell } from './trace-body-cell';
import { renderCellInputForTrace } from './trace-utils/render-cell-input-for-trace';
import { readToolOutputBlock } from './trace-utils/render-tool-output-for-trace';
import type { TraceComponentProps } from './types';

export function SubAgentTrace(props: TraceComponentProps<'sub-agent'>) {
  const data = props.trace.data;
  const input = renderCellInputForTrace(data.input);
  const output = readToolOutputBlock({
    error: data.error,
    result: data.output === undefined || data.output.length === 0 ? undefined : data.output,
  });
  const status: AgentTraceItemStatus =
    data.status === 'error' ? 'error' : data.status === 'pending' ? 'pending' : 'success';

  return (
    <AgentTraceItem
      icon="Bot"
      title={`Sub-agent: ${data.agentTemplateId}`}
      titleAction={renderOpenAction(props)}
      timestamp={props.trace.createdAt}
      status={status}
      error={data.error}
      content={<TraceBodyCell data={input} footer={output} framed={false} maxHeight={180} type="plaintext" />}
    />
  );
}

function renderOpenAction(props: TraceComponentProps<'sub-agent'>) {
  if (props.onAgentClick === undefined) return undefined;

  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 text-xs font-medium text-content-muted transition-colors hover:text-accent focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
      onClick={(event) => {
        event.stopPropagation();
        props.onAgentClick?.(props.trace.data.agentInstanceId);
      }}
    >
      Open
      <Icon name="ArrowRight" className="h-3 w-3 text-current" />
    </button>
  );
}
