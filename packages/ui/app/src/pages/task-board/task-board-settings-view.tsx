import { AppBox, Button, Icon, ListLayout, Section, Select, Surface } from '@two-pebble/components';
import type { TaskPoolRecord } from '@two-pebble/realtime';

const NONE_VALUE = '__none__';

interface TaskBoardSettingsViewProps {
  pools: TaskPoolRecord[];
  onDeletePool: (poolId: string) => void;
  onSetPoolTemplate: (poolId: string, templateId: string | null) => void;
  onDeleteBoard: () => void;
  templates: Array<{ id: string; name: string; prompt: string }>;
  onCreateTemplate: (input: { name: string; prompt?: string }) => void;
  onSelectTemplate: (templateId: string) => void;
  selectedTemplateId: string | null;
  boardTemplateId: string | null;
  onBoardTemplateChange: (templateId: string | null) => void;
}

export function TaskBoardSettingsView(props: TaskBoardSettingsViewProps) {
  const templateOptions = [
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
        title="Board template"
        subtitle="The template assigned to this board. Applied to new tasks unless a group or task picks its own template."
      >
        <Surface>
          <Select
            fullWidth
            label="Board template"
            onChange={(value) => props.onBoardTemplateChange(value === NONE_VALUE ? null : value)}
            options={templateOptions}
            placeholder={props.templates.length === 0 ? 'Create a template first' : 'Select template'}
            value={props.boardTemplateId ?? NONE_VALUE}
          />
        </Surface>
      </Section>
      <Section compact title="Groups" subtitle="Assign a template per group. Tasks added to a group use its template.">
        <Surface>
          {props.pools.length === 0 ? (
            <p className="text-[12px] leading-4 text-content-muted">No groups yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {props.pools.map((pool) => (
                <div
                  key={pool.id}
                  className="flex min-w-0 items-center justify-between gap-3 rounded-md border border-border px-3 py-2"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Icon name="folder" color="text-content-muted" />
                    <span className="truncate text-[13px] font-medium leading-5 text-content">{pool.name}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Select
                      onChange={(value) => props.onSetPoolTemplate(pool.id, value === NONE_VALUE ? null : value)}
                      options={templateOptions}
                      placeholder={props.templates.length === 0 ? 'No templates' : 'Board template'}
                      value={pool.defaultTemplateId ?? NONE_VALUE}
                    />
                    <Button leftIcon="trash" onClick={() => props.onDeletePool(pool.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Surface>
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
