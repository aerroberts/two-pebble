import { Icon } from '../content/icon/icon';
import { Duration } from '../data/duration/duration';
import { TraceBodyCell } from './trace-body-cell';
import { estimateToolResultByteCount, readToolOutputBlock } from './trace-utils/render-tool-output-for-trace';
import { toolTraceIcon } from './trace-utils/tool-trace-icon';
import type { AgentTraceByType } from './types';

export interface ToolTraceGroupProps {
  traces: AgentTraceByType<'tool'>[];
}

export function ToolTraceGroup(props: ToolTraceGroupProps) {
  return (
    <div className="flex w-full flex-col gap-2 px-3 py-2">
      <div className="flex w-full items-center gap-2">
        <div className="flex flex-1 items-center gap-3 min-w-0">
          <Icon name={toolGroupIcon(props.traces)} className="shrink-0 text-content-muted" />
          <span className="truncate text-sm font-medium text-content">{formatToolGroupTitle(props.traces.length)}</span>
        </div>
      </div>
      <div className="ml-7 overflow-hidden rounded-md border border-border/60 bg-surface divide-y divide-border/50">
        {props.traces.map((trace) => (
          <ToolTraceGroupRow key={trace.id} trace={trace} />
        ))}
      </div>
    </div>
  );
}

interface ToolTraceGroupRowProps {
  trace: AgentTraceByType<'tool'>;
}

function ToolTraceGroupRow(props: ToolTraceGroupRowProps) {
  const data = props.trace.data;
  const inputByteCount = estimateByteCount(data.input);
  const resultByteCount = estimateToolResultByteCount(data.result);
  const output = readToolOutputBlock({ error: data.error, result: data.result });
  const metadata = readToolMetadata(data.toolId, data.input);

  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none items-center gap-2 bg-surface px-3 py-2 transition-colors hover:bg-surface-hover/45 [&::-webkit-details-marker]:hidden">
        <Icon name={toolTraceIcon(data.source)} className="shrink-0 text-content-muted" />
        <span className="min-w-0 truncate text-sm font-medium text-content">{data.toolId}</span>
        {metadata === undefined ? null : (
          <span className="min-w-0 flex-1 truncate font-mono text-xs text-content-muted">{metadata}</span>
        )}
        {metadata === undefined ? <span className="min-w-0 flex-1" /> : null}
        <span className="shrink-0 text-xs text-content-muted">
          Input <span className="text-accent">{formatByteCount(inputByteCount)}</span>
          {resultByteCount === undefined ? null : (
            <>
              {' '}
              , output <span className="text-success">{formatByteCount(resultByteCount)}</span>
            </>
          )}
        </span>
        {data.duration === undefined ? null : (
          <Duration compact hideInfoIcon start={props.trace.createdAt} end={props.trace.createdAt + data.duration} />
        )}
        <Icon name="ChevronDown" className="shrink-0 text-content-muted transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t border-border/50 bg-surface-alt/45">
        <TraceBodyCell type="json" data={data.input} maxHeight={160} framed={false} embedded footer={output} />
      </div>
    </details>
  );
}

function formatToolGroupTitle(count: number) {
  return `Called ${count} ${count === 1 ? 'Tool' : 'Tools'}`;
}

function toolGroupIcon(traces: AgentTraceByType<'tool'>[]) {
  const firstSource = traces.at(0)?.data.source;

  if (firstSource === undefined) {
    return 'Wrench';
  }

  if (traces.every((trace) => trace.data.source === firstSource)) {
    return toolTraceIcon(firstSource);
  }

  return 'Wrench';
}

function estimateByteCount(value: unknown) {
  const rendered = typeof value === 'string' ? value : JSON.stringify(value);

  return new TextEncoder().encode(rendered ?? '').length;
}

function formatByteCount(count: number) {
  return `${count} ${count === 1 ? 'byte' : 'bytes'}`;
}

function readToolMetadata(toolId: string, input: unknown): string | undefined {
  if (input === null || typeof input !== 'object') {
    return undefined;
  }
  const record = input as Record<string, unknown>;
  const normalizedId = toolId.toLowerCase();
  if (normalizedId === 'bash') {
    return readStringField(record, 'description') ?? readStringField(record, 'command');
  }
  if (normalizedId === 'read') {
    const path = readStringField(record, 'file_path') ?? readStringField(record, 'filePath');
    return path === undefined ? undefined : trimPathToLastSegments(path, 3);
  }
  if (normalizedId === 'grep') {
    return readStringField(record, 'pattern');
  }
  if (normalizedId === 'edit' || normalizedId === 'write') {
    const path = readStringField(record, 'file_path') ?? readStringField(record, 'filePath');
    return path === undefined ? undefined : trimPathToLastSegments(path, 3);
  }
  return undefined;
}

function readStringField(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function trimPathToLastSegments(path: string, segmentCount: number): string {
  const parts = path.split('/').filter((part) => part.length > 0);
  if (parts.length <= segmentCount) {
    return path;
  }
  return `…/${parts.slice(-segmentCount).join('/')}`;
}
