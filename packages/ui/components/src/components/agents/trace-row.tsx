import { AgentTraceItem, type AgentTraceItemProps } from './agent-trace-item';
import { TraceBodyCell } from './trace-body-cell';

export interface TraceRowProps {
  data?: unknown;
  duration?: number;
  icon: AgentTraceItemProps['icon'];
  onClick?: () => void;
  status?: AgentTraceItemProps['status'];
  timestamp: number;
  title: string;
  tone?: AgentTraceItemProps['tone'];
}

export function TraceRow(props: TraceRowProps) {
  return (
    <AgentTraceItem
      icon={props.icon}
      onClick={props.onClick}
      title={props.title}
      timestamp={props.timestamp}
      duration={props.duration}
      status={props.status ?? 'atomic'}
      tone={props.tone}
      content={
        props.data === undefined || props.data === null ? undefined : (
          <TraceBodyCell type="json" data={props.data} maxHeight={200} />
        )
      }
    />
  );
}
