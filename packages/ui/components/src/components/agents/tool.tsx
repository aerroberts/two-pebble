import { AgentTraceItem, type AgentTraceItemStatus } from './agent-trace-item';
import { TraceBodyCell } from './trace-body-cell';
import { readToolOutputBlock } from './trace-utils/render-tool-output-for-trace';
import { toolTraceIcon } from './trace-utils/tool-trace-icon';
import type { TraceComponentProps } from './types';

export function ToolTrace(props: TraceComponentProps<'tool'>) {
  const data = props.trace.data;
  const status: AgentTraceItemStatus =
    data.status === 'error' ? 'error' : data.status === 'pending' ? 'pending' : 'success';
  const output = readToolOutputBlock({ error: data.error, result: data.result });

  return (
    <AgentTraceItem
      icon={toolTraceIcon(data.source)}
      title={data.toolId}
      timestamp={props.trace.createdAt}
      duration={data.duration}
      status={status}
      error={data.error}
      content={<TraceBodyCell type="json" data={data.input} maxHeight={160} framed={false} footer={output} />}
    />
  );
}
