import { Button, Input, ListLayout, type ListLayoutItem, Section, Surface } from '@two-pebble/components';
import type { TaskPoolRecord } from '@two-pebble/realtime';

interface TaskBoardSettingsViewProps {
  boardNameDraft: string;
  onBoardNameChange: (value: string) => void;
  onBoardNameSave: () => void;
  pools: TaskPoolRecord[];
  onDeletePool: (poolId: string) => void;
  onDeleteBoard: () => void;
}

export function TaskBoardSettingsView(props: TaskBoardSettingsViewProps) {
  return (
    <>
      <Section compact title="Board name">
        <Input
          aria-label="Board name"
          onBlur={props.onBoardNameSave}
          onChange={(event) => props.onBoardNameChange(event.target.value)}
          placeholder="Untitled board"
          value={props.boardNameDraft}
        />
      </Section>
      <Section compact title="Groups">
        <ListLayout
          emptyState="No groups yet."
          items={props.pools.map((pool) => toPoolItem(pool, props.onDeletePool))}
        />
      </Section>
      <Section compact title="Danger zone">
        <Surface>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-content">Delete board</div>
              <div className="text-xs text-content-muted">
                Permanently removes the board and every task it contains.
              </div>
            </div>
            <Button leftIcon="trash" onClick={props.onDeleteBoard}>
              Delete board
            </Button>
          </div>
        </Surface>
      </Section>
    </>
  );
}

function toPoolItem(pool: TaskPoolRecord, onDelete: (poolId: string) => void): ListLayoutItem {
  return {
    key: pool.id,
    icon: 'folder',
    title: pool.name,
    trailingAccessory: (
      <Button leftIcon="trash" onClick={() => onDelete(pool.id)}>
        Delete
      </Button>
    ),
  };
}
