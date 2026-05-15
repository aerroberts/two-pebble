import { Icon } from '../content/icon/icon';
import { AgentTraceItem } from './agent-trace-item';
import { toolTraceIcon } from './trace-utils/tool-trace-icon';
import type { TraceComponentProps } from './types';

export function CapabilityRegisterTrace(props: TraceComponentProps<'capability-register'>) {
  const data = props.trace.data;

  return (
    <AgentTraceItem
      content={
        <div className="flex flex-col gap-2">
          <p className="whitespace-pre-wrap text-sm leading-6 text-content-muted">{data.description}</p>
          <div className="w-full overflow-hidden rounded-md border border-border bg-surface">
            {data.tools.map((tool) => (
              <div
                key={`${tool.type}:${tool.name}`}
                className="flex gap-2 border-t border-border px-2 py-1.5 first:border-t-0"
              >
                <div className="pt-0.5">
                  <Icon name={getToolTypeIcon(tool.type)} className="shrink-0 text-content-muted" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-sm font-medium text-content">{tool.name}</span>
                  </div>
                  <p className="text-sm leading-5 text-content-muted">{tool.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      }
      icon="PackagePlus"
      status="atomic"
      timestamp={props.trace.createdAt}
      title={`Capability registered: ${data.name}`}
    />
  );
}

function getToolTypeIcon(type: string) {
  return toolTraceIcon(type);
}
