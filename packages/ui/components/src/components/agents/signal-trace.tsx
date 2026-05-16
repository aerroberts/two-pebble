import { AgentTraceItem, type IconName } from './agent-trace-item';
import type { TraceComponentProps } from './types';

const STATUS_ICON: Record<string, IconName> = {
  open: 'CircleDot',
  received: 'CircleCheck',
  resolved: 'CircleCheckBig',
};

function statusIcon(status: string): IconName {
  return STATUS_ICON[status] ?? 'CircleDot';
}

export function SignalRegisteredTrace(props: TraceComponentProps<'signal-registered'>) {
  const data = props.trace.data;
  return (
    <AgentTraceItem
      icon={statusIcon(data.status)}
      timestamp={props.trace.createdAt}
      title={`Signal registered: ${data.name}`}
      status="atomic"
      content={data.description.length > 0 ? <p className="text-sm leading-5 text-content-muted">{data.description}</p> : undefined}
    />
  );
}

export function SignalReceivedTrace(props: TraceComponentProps<'signal-received'>) {
  const data = props.trace.data;
  return (
    <AgentTraceItem
      icon={statusIcon(data.status)}
      timestamp={props.trace.createdAt}
      title={`Signal received: ${data.name}`}
      status="atomic"
      content={data.description.length > 0 ? <p className="text-sm leading-5 text-content-muted">{data.description}</p> : undefined}
    />
  );
}

export function SignalResolvedTrace(props: TraceComponentProps<'signal-resolved'>) {
  const data = props.trace.data;
  return (
    <AgentTraceItem
      icon={statusIcon(data.status)}
      timestamp={props.trace.createdAt}
      title={`Signal resolved: ${data.name}`}
      status="atomic"
      content={data.description.length > 0 ? <p className="text-sm leading-5 text-content-muted">{data.description}</p> : undefined}
    />
  );
}

export function AgentWaitingTrace(props: TraceComponentProps<'agent-waiting'>) {
  const signals = props.trace.data.signals;
  const list = signals.map((signal) => signal.name).join(', ');
  return (
    <AgentTraceItem
      icon="Clock"
      timestamp={props.trace.createdAt}
      title={list.length === 0 ? 'Agent waiting' : `Agent waiting on ${list}`}
      status="atomic"
    />
  );
}
