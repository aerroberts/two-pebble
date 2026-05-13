import { AppBox, Button, Input, ListLayout, type ListLayoutItem, Section, Surface } from '@two-pebble/components';
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
          <AppBox variant="delete-row">
            <div>
              <AppBox variant="delete-title">Delete board</AppBox>
              <AppBox variant="delete-description">
                Permanently removes the board and every task it contains.
              </AppBox>
            </div>
            <Button leftIcon="trash" onClick={props.onDeleteBoard}>
              Delete board
            </Button>
          </AppBox>
        </Surface>
      </Section>
    </>
  );
}

interface PoolItemInput {
  pool: TaskPoolRecord;
  onDelete: PoolDeleteHandler;
}

type PoolDeleteHandler = (poolId: string) => void;

function toPoolItem(pool: TaskPoolRecord, onDelete: PoolDeleteHandler): ListLayoutItem {
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
