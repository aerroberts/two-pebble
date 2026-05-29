import { AppBox, Button, Icon, IconButton, Input, Select } from '@two-pebble/components';
import { markdownToTipTap } from '@two-pebble/datatypes';
import { useTemplateDeliverables } from '@two-pebble/realtime';
import { useEffect, useMemo, useState } from 'react';
import { RichTextFieldHost } from '../../shared/agent-input/rich-text-field-host';

export interface TaskTemplateEditorTemplate {
  id: string;
  name: string;
  prompt: string;
}

export interface TaskTemplateEditorSidebarProps {
  template: TaskTemplateEditorTemplate;
  onUpdateTemplate: (input: { id: string; name?: string; prompt?: string }) => void;
  onDeleteTemplate: (id: string) => void;
  onCreateDeliverable: (input: {
    templateId: string;
    name: string;
    description?: string;
    type: 'text' | 'pr_url';
    orderIndex?: number;
  }) => void;
  onUpdateDeliverable: (input: {
    id: string;
    name?: string;
    description?: string;
    type?: 'text' | 'pr_url';
    orderIndex?: number;
  }) => void;
  onDeleteDeliverable: (id: string) => void;
}

const DELIVERABLE_TYPE_OPTIONS = [
  { value: 'text', label: 'Text', icon: <Icon name="file-text" color="text-current" /> },
  { value: 'pr_url', label: 'PR URL', icon: <Icon name="git-pull-request" color="text-current" /> },
];

/**
 * Task template editor body rendered inside the board's right-hand
 * drawer when a template is selected. Replaces the previous inline
 * expansion in the settings list so editing happens in the standard
 * detail-drawer surface instead of widening the list row.
 */
export function TaskTemplateEditorSidebar(props: TaskTemplateEditorSidebarProps) {
  const [name, setName] = useState(props.template.name);
  const { deliverables } = useTemplateDeliverables({ templateId: props.template.id });
  const promptDoc = useMemo(() => markdownToTipTap(props.template.prompt), [props.template.prompt]);

  useEffect(() => {
    setName(props.template.name);
  }, [props.template.name]);

  return (
    <div className="flex flex-col gap-2">
      <Input
        aria-label="Template name"
        label="Name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        onBlur={() => props.onUpdateTemplate({ id: props.template.id, name: name.trim() || props.template.name })}
      />
      <RichTextFieldHost
        key={props.template.id}
        ariaLabel="Template prompt"
        label="Additional system prompt"
        minHeight={120}
        onCommit={(payload) => props.onUpdateTemplate({ id: props.template.id, prompt: payload.markdown })}
        placeholder="Additional system prompt — / to reference a document"
        value={promptDoc}
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
      <div className="flex flex-col gap-3">
        {deliverables.map((deliverable) => (
          <div
            key={deliverable.id}
            className="flex flex-col gap-2 rounded-md border border-border bg-surface-neutral p-2"
          >
            <div className="grid grid-cols-[1fr_8rem_auto] items-end gap-2">
              <Input
                aria-label="Deliverable name"
                label="Name"
                value={deliverable.name}
                onChange={(event) => props.onUpdateDeliverable({ id: deliverable.id, name: event.target.value })}
              />
              <Select
                options={DELIVERABLE_TYPE_OPTIONS}
                value={deliverable.type}
                onChange={(value) =>
                  props.onUpdateDeliverable({ id: deliverable.id, type: value as 'text' | 'pr_url' })
                }
              />
              <IconButton
                aria-label="Delete deliverable"
                icon="trash"
                onClick={() => props.onDeleteDeliverable(deliverable.id)}
                variant="secondary"
              />
            </div>
            <textarea
              aria-label="Deliverable description"
              className="block min-h-16 w-full resize-y rounded-md border border-border bg-surface px-3 py-2 text-sm leading-5 text-content outline-none placeholder:text-content-subtle focus:border-strong"
              value={deliverable.description}
              onChange={(event) => props.onUpdateDeliverable({ id: deliverable.id, description: event.target.value })}
              placeholder="Description"
            />
          </div>
        ))}
      </div>
      <AppBox variant="controls-row">
        <Button leftIcon="trash" onClick={() => props.onDeleteTemplate(props.template.id)}>
          Delete template
        </Button>
      </AppBox>
    </div>
  );
}
