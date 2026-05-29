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
  const hasTemplates = props.templates.length > 0;

  return (
    <>
      <Section
        compact
        title="Task Templates"
        subtitle="Reusable templates that seed a task's prompt and deliverables. Select one to edit it."
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
        title="Templates"
        subtitle="Assign which template applies to new tasks. Group assignments override the board template."
      >
        <Surface>
          <div className="flex flex-col gap-2">
            <TemplateAssignmentRow
              icon="layout-dashboard"
              label="Board"
              hasTemplates={hasTemplates}
              options={templateOptions}
              placeholder={hasTemplates ? 'No template' : 'Create a template first'}
              value={props.boardTemplateId ?? NONE_VALUE}
              onChange={(value) => props.onBoardTemplateChange(value === NONE_VALUE ? null : value)}
            />
            {props.pools.map((pool) => (
              <TemplateAssignmentRow
                key={pool.id}
                icon="folder"
                label={pool.name}
                hasTemplates={hasTemplates}
                options={templateOptions}
                placeholder={hasTemplates ? 'Board template' : 'Create a template first'}
                value={pool.defaultTemplateId ?? NONE_VALUE}
                onChange={(value) => props.onSetPoolTemplate(pool.id, value === NONE_VALUE ? null : value)}
              />
            ))}
          </div>
        </Surface>
      </Section>
      <Section compact title="Groups">
        <ListLayout
          emptyState="No groups yet."
          items={props.pools.map((pool) => ({
            key: pool.id,
            icon: 'folder',
            title: pool.name,
            trailingAccessory: (
              <Button leftIcon="trash" onClick={() => props.onDeletePool(pool.id)}>
                Delete
              </Button>
            ),
          }))}
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

interface TemplateAssignmentRowProps {
  icon: 'layout-dashboard' | 'folder';
  label: string;
  hasTemplates: boolean;
  options: Array<{ label: string; value: string }>;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

function TemplateAssignmentRow(props: TemplateAssignmentRowProps) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <Icon name={props.icon} color="text-content-muted" />
        <span className="truncate text-[13px] font-medium leading-5 text-content">{props.label}</span>
      </div>
      <Select
        disabled={!props.hasTemplates}
        onChange={props.onChange}
        options={props.options}
        placeholder={props.placeholder}
        value={props.value}
      />
    </div>
  );
}
