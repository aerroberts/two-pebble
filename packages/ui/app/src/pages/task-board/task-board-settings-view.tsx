import {
  AppBox,
  Button,
  Input,
  ListLayout,
  type ListLayoutItem,
  Section,
  Select,
  Surface,
} from '@two-pebble/components';
import type { TaskPoolRecord } from '@two-pebble/realtime';
import { useTemplateDeliverables } from '@two-pebble/realtime';
import { useState } from 'react';

interface TaskBoardSettingsViewProps {
  pools: TaskPoolRecord[];
  onDeletePool: (poolId: string) => void;
  onDeleteBoard: () => void;
  templates: Array<{ id: string; name: string; prompt: string }>;
  onCreateTemplate: (input: { name: string; prompt?: string }) => void;
  onUpdateTemplate: (input: { id: string; name?: string; prompt?: string }) => void;
  onDeleteTemplate: (id: string) => void;
  onCreateTemplateDeliverable: (input: {
    templateId: string;
    name: string;
    description?: string;
    type: 'text' | 'pr_url';
    orderIndex?: number;
  }) => void;
  onUpdateTemplateDeliverable: (input: {
    id: string;
    name?: string;
    description?: string;
    type?: 'text' | 'pr_url';
    orderIndex?: number;
  }) => void;
  onDeleteTemplateDeliverable: (id: string) => void;
}

const DELIVERABLE_TYPE_OPTIONS = [
  { value: 'text', label: 'Text' },
  { value: 'pr_url', label: 'PR URL' },
];

export function TaskBoardSettingsView(props: TaskBoardSettingsViewProps) {
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
            trailingAccessory: (
              <TaskTemplateEditor
                template={template}
                onUpdateTemplate={props.onUpdateTemplate}
                onDeleteTemplate={props.onDeleteTemplate}
                onCreateDeliverable={props.onCreateTemplateDeliverable}
                onUpdateDeliverable={props.onUpdateTemplateDeliverable}
                onDeleteDeliverable={props.onDeleteTemplateDeliverable}
              />
            ),
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

interface TaskTemplateEditorProps {
  template: { id: string; name: string; prompt: string };
  onUpdateTemplate: TaskBoardSettingsViewProps['onUpdateTemplate'];
  onDeleteTemplate: TaskBoardSettingsViewProps['onDeleteTemplate'];
  onCreateDeliverable: TaskBoardSettingsViewProps['onCreateTemplateDeliverable'];
  onUpdateDeliverable: TaskBoardSettingsViewProps['onUpdateTemplateDeliverable'];
  onDeleteDeliverable: TaskBoardSettingsViewProps['onDeleteTemplateDeliverable'];
}

function TaskTemplateEditor(props: TaskTemplateEditorProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(props.template.name);
  const [prompt, setPrompt] = useState(props.template.prompt);
  const { deliverables } = useTemplateDeliverables({ templateId: open ? props.template.id : '' });
  if (!open) {
    return (
      <Button leftIcon="chevron-right" onClick={() => setOpen(true)} variant="secondary">
        Edit
      </Button>
    );
  }
  return (
    <div className="flex min-w-[28rem] flex-col gap-2">
      <Input
        aria-label="Template name"
        label="Name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        onBlur={() => props.onUpdateTemplate({ id: props.template.id, name: name.trim() || props.template.name })}
      />
      <textarea
        aria-label="Template prompt"
        className="block min-h-24 w-full resize-y rounded-md border border-border bg-surface-neutral px-3 py-2 text-sm leading-5 text-content outline-none placeholder:text-content-subtle focus:border-strong"
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        onBlur={() => props.onUpdateTemplate({ id: props.template.id, prompt })}
        placeholder="Additional system prompt"
      />
      <div className="flex items-center justify-between">
        <AppBox variant="muted-xs">Deliverables</AppBox>
        <Button
          leftIcon="plus"
          onClick={() =>
            props.onCreateDeliverable({
              templateId: props.template.id,
              name: 'New deliverable',
              type: 'text',
              orderIndex: deliverables.length,
            })
          }
        >
          Add
        </Button>
      </div>
      <div className="flex flex-col gap-2">
        {deliverables.map((deliverable) => (
          <div key={deliverable.id} className="grid grid-cols-[1fr_1fr_8rem_auto] items-end gap-2">
            <Input
              aria-label="Deliverable name"
              label="Name"
              value={deliverable.name}
              onChange={(event) => props.onUpdateDeliverable({ id: deliverable.id, name: event.target.value })}
            />
            <Input
              aria-label="Deliverable description"
              label="Description"
              value={deliverable.description}
              onChange={(event) => props.onUpdateDeliverable({ id: deliverable.id, description: event.target.value })}
            />
            <Select
              options={DELIVERABLE_TYPE_OPTIONS}
              value={deliverable.type}
              onChange={(value) => props.onUpdateDeliverable({ id: deliverable.id, type: value as 'text' | 'pr_url' })}
            />
            <Button leftIcon="trash" onClick={() => props.onDeleteDeliverable(deliverable.id)}>
              Remove
            </Button>
          </div>
        ))}
      </div>
      <AppBox variant="controls-row">
        <Button onClick={() => setOpen(false)} variant="secondary">
          Close
        </Button>
        <Button leftIcon="trash" onClick={() => props.onDeleteTemplate(props.template.id)}>
          Delete template
        </Button>
      </AppBox>
    </div>
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
