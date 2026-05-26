import { AppBox, Button, ListLayout, type ListLayoutItem, Section, Surface } from '@two-pebble/components';
import type { TaskPoolRecord } from '@two-pebble/realtime';

interface TaskBoardSettingsViewProps {
  pools: TaskPoolRecord[];
  onDeletePool: (poolId: string) => void;
  onDeleteBoard: () => void;
  templates: Array<{ id: string; name: string; prompt: string }>;
  onCreateTemplate: (input: { name: string; prompt?: string }) => void;
  onSelectTemplate: (templateId: string) => void;
  selectedTemplateId: string | null;
}

export function TaskBoardSettingsView(props: TaskBoardSettingsViewProps) {
  return (
    <>
      <Section compact title="Task templates">
        <div className="flex justify-end pb-2">
          <Button leftIcon="plus" onClick={() => props.onCreateTemplate({ name: 'New template', prompt: '' })}>
            Add template
          </Button>
        </div>
        <ListLayout
          emptyState="No task templates yet."
          items={props.templates.map((template) => ({
            key: template.id,
            icon: 'file-text',
            title: template.name,
            active: template.id === props.selectedTemplateId,
            onClick: () => props.onSelectTemplate(template.id),
          }))}
        />
      </Section>
      <Section compact title="Groups">
        <ListLayout
          emptyState="No groups yet."
          items={props.pools.map((pool) => toPoolItem({ pool, onDelete: props.onDeletePool }))}
        />
      </Section>
      <Section compact title="Danger zone">
        <Surface>
          <AppBox variant="delete-row">
            <div>
              <AppBox variant="delete-title">Delete board</AppBox>
              <AppBox variant="delete-description">Permanently removes the board and every task it contains.</AppBox>
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
  onDelete: (poolId: string) => void;
}

function toPoolItem(input: PoolItemInput): ListLayoutItem {
  return {
    key: input.pool.id,
    icon: 'folder',
    title: input.pool.name,
    trailingAccessory: (
      <Button leftIcon="trash" onClick={() => input.onDelete(input.pool.id)}>
        Delete
      </Button>
    ),
  };
}
