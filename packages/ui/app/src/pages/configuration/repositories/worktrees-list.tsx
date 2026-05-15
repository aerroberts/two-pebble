import { IconButton, ListLayout, Status, type StatusState } from '@two-pebble/components';
import type { LoadableRegistry, WorktreeRecord, WorktreeStatus } from '@two-pebble/realtime';

interface WorktreesListProps {
  entries: ReturnType<LoadableRegistry<WorktreeRecord>['entries']>;
  loading: boolean;
  onDeleteClick: (worktreeId: string) => void;
}

const STATUS_STATE: Record<WorktreeStatus, StatusState> = {
  active: 'success',
  creating: 'in-progress',
  deleted: 'failed',
};

const STATUS_LABEL: Record<WorktreeStatus, string> = {
  active: 'Worktree active',
  creating: 'Creating worktree',
  deleted: 'Worktree inactive',
};

export function WorktreesList(props: WorktreesListProps) {
  return (
    <ListLayout
      emptyState={props.loading ? 'Loading worktrees.' : 'No worktrees for this repository.'}
      items={props.entries.map((entry) => ({
        key: entry.id,
        subtitle: entry.value.path.length > 0 ? entry.value.path : 'Pending path',
        title: entry.value.branch,
        trailingAccessory:
          entry.value.status === 'deleted' ? null : (
            <IconButton
              aria-label="Delete worktree"
              icon="trash-2"
              onClick={() => props.onDeleteClick(entry.id)}
              type="button"
              variant="secondary"
            />
          ),
        value: (
          <Status label={STATUS_LABEL[entry.value.status]} state={STATUS_STATE[entry.value.status]} variant="pill" />
        ),
      }))}
    />
  );
}
