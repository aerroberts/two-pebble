import { AppBox, Button, ListLayout, type ListLayoutItem, Section, Select, Surface } from '@two-pebble/components';
import type { TaskPoolRecord } from '@two-pebble/realtime';

const NONE_VALUE = '__none__';

interface TaskBoardSettingsViewProps {
  pools: TaskPoolRecord[];
  onDeletePool: (poolId: string) => void;
  onDeleteBoard: () => void;
  templates: Array<{ id: string; name: string; prompt: string }>;
  onCreateTemplate: (input: { name: string; prompt?: string }) => void;
  onSelectTemplate: (templateId: string) => void;
  selectedTemplateId: string | null;
  defaultTemplateId: string | null;
  onDefaultTemplateChange: (templateId: string | null) => void;
}

export function TaskBoardSettingsView(props: TaskBoardSettingsViewProps) {
  const defaultTemplateOptions = [
    { label: 'None', value: NONE_VALUE },
    ...props.templates.map((template) => ({ label: template.name, value: template.id })),
  ];

  return (
    <>
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
      <Section
        compact
        title="Default template"
        subtitle="Applied to new tasks on this board when no template is selected on creation."
      >
        <Surface>
          <Select
            fullWidth
            label="Default template"
            onChange={(value) => props.onDefaultTemplateChange(value === NONE_VALUE ? null : value)}
            options={defaultTemplateOptions}
            placeholder={props.templates.length === 0 ? 'Create a template first' : 'Select template'}
            value={props.defaultTemplateId ?? NONE_VALUE}
          />
        </Surface>
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
