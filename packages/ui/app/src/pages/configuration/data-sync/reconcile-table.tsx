import { Checkbox, Surface } from '@two-pebble/components';
import type { DiffStatus, ReconcileEntry, ReconcilePlan } from '@two-pebble/protocol';

const STATUS_LABEL: Record<DiffStatus, string> = {
  new: 'New',
  changed: 'Changed',
  unchanged: 'Unchanged',
  blocked: 'Blocked',
};

const STATUS_COLOR: Record<DiffStatus, string> = {
  new: 'text-green-600',
  changed: 'text-amber-600',
  unchanged: 'text-content-muted',
  blocked: 'text-red-600',
};

const ENTITY_LABEL: Record<ReconcileEntry['entityType'], string> = {
  project: 'Project',
  repository: 'Repository',
  agentRegistry: 'Agent',
  document: 'Document',
  automation: 'Automation',
  board: 'Board',
};

function groupLabel(entry: ReconcileEntry): string {
  return entry.projectName ?? 'Global';
}

export interface ReconcileTableProps {
  plan: ReconcilePlan;
  onToggle: (key: string, selected: boolean) => void;
}

export function ReconcileTable(props: ReconcileTableProps) {
  // Hide unchanged rows; they are not actionable.
  const visible = props.plan.entries.filter((entry) => entry.baseStatus !== 'unchanged');
  const groups = new Map<string, ReconcileEntry[]>();
  for (const entry of visible) {
    const key = groupLabel(entry);
    const list = groups.get(key) ?? [];
    list.push(entry);
    groups.set(key, list);
  }

  if (visible.length === 0) {
    return <Surface>Nothing to {props.plan.direction}. Both sides already match.</Surface>;
  }

  return (
    <div className="flex flex-col gap-4">
      {[...groups.entries()].map(([group, entries]) => (
        <div key={group} className="flex flex-col gap-1">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-content-muted">{group}</div>
          <div className="overflow-hidden rounded-md border border-border bg-surface">
            {entries.map((entry) => (
              <div key={entry.key} className="flex items-start gap-3 border-b border-border px-3 py-2 last:border-b-0">
                <Checkbox
                  checked={entry.selected}
                  disabled={entry.status === 'blocked'}
                  onChange={(event) => props.onToggle(entry.key, event.target.checked)}
                />
                <div className="flex flex-1 flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-semibold ${STATUS_COLOR[entry.status]}`}>
                      {STATUS_LABEL[entry.status]}
                    </span>
                    <span className="text-[11px] text-content-muted">{ENTITY_LABEL[entry.entityType]}</span>
                    <span className="text-[13px] font-medium text-content">{entry.name}</span>
                  </div>
                  {entry.status === 'blocked' && entry.blockedBy.length > 0 ? (
                    <span className="text-[11px] text-red-600">Needs: {entry.blockedBy.join(', ')}</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {props.plan.direction === 'export' && props.plan.orphans.length > 0 ? (
        <Surface>
          {props.plan.orphans.length} orphan file{props.plan.orphans.length === 1 ? '' : 's'} will be removed from disk.
        </Surface>
      ) : null}
      {props.plan.warnings.length > 0 ? (
        <Surface>
          <div className="flex flex-col gap-1">
            {props.plan.warnings.map((warning) => (
              <span key={warning} className="text-[12px] text-amber-600">
                {warning}
              </span>
            ))}
          </div>
        </Surface>
      ) : null}
    </div>
  );
}
