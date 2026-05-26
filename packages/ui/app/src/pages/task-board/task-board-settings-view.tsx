import { AppBox, Button, Input, ListLayout, type ListLayoutItem, Section, Surface } from '@two-pebble/components';
import type { TaskPoolRecord } from '@two-pebble/realtime';

interface TaskBoardSettingsViewProps {
  boardNameDraft: string;
  onBoardNameChange: (value: string) => void;
  onBoardNameSave: () => void;
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
      <Section compact title="Board name">
        <Input
          aria-label="Board name"
          onBlur={props.onBoardNameSave}
          onChange={(event) => props.onBoardNameChange(event.target.value)}
          placeholder="Untitled board"
          value={props.boardNameDraft}
        />
      </Section>
      <Section
        compact
        title="Task templates"
        actionItems={
          <Button leftIcon="plus" onClick={() => props.onCreateTemplate({ name: 'New template', prompt: '' })}>
            Add template
          </Button>
        }
      >
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
