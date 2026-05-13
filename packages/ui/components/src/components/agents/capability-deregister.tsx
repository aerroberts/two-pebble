import { Icon } from '../content/icon/icon';
import { AgentTraceItem } from './agent-trace-item';
import { renderCellInputForTrace } from './trace-utils/render-cell-input-for-trace';
import { toolTraceIcon } from './trace-utils/tool-trace-icon';
import type { TraceComponentProps } from './types';

export function CapabilityDeregisterTrace(props: TraceComponentProps<'capability-deregister'>) {
  const reason = stringifyTraceContent(renderCellInputForTrace(props.trace.data.reason));

  return (
    <AgentTraceItem
      content={
        <div className="flex flex-col gap-2">
          <p className="whitespace-pre-wrap text-sm leading-6 text-content-muted">{reason}</p>
          <div className="flex flex-wrap gap-1.5">
            {props.trace.data.toolDeregistrations.map((tool) => (
              <span
                key={`${tool.type}:${tool.name}`}
                className="inline-flex items-center gap-1.5 rounded-sm border border-border/50 bg-surface px-2 py-1 font-mono text-[11px] leading-none text-content-muted"
              >
                <Icon name={toolTraceIcon(tool.type)} className="size-3 shrink-0" />
                {tool.name}
              </span>
            ))}
          </div>
        </div>
      }
      icon="PackageMinus"
      status="success"
      timestamp={props.trace.createdAt}
      title={`Capability deregistered: ${props.trace.data.capabilityId}`}
    />
  );
}

function stringifyTraceContent(value: unknown): string {
  return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
}
