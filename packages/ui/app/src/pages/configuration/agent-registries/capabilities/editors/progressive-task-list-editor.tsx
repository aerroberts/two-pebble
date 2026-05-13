import { Button, IconButton, Input, Section, Surface } from '@two-pebble/components';
import type { CapabilityEditorProps } from '../known-capabilities';
import type { ProgressiveTaskListConfig, ProgressiveTaskListTaskInput } from '../types';

/**
 * Inline editor for the `progressive-task-list` capability config.
 * Each task gets its own surface block with an ID + Description input;
 * the "Add task" button appends a fresh row. Mutations flow back
 * through `onChange` and persist via the registry update path.
 */
export function ProgressiveTaskListEditor(props: CapabilityEditorProps<ProgressiveTaskListConfig>) {
  const tasks = props.config.tasks ?? [];
  return (
    <Section
      actionItems={
        <Button leftIcon="plus" onClick={() => addTask(props, tasks)} type="button" variant="secondary">
          Add task
        </Button>
      }
      title="Tasks"
    >
      {tasks.length === 0 ? (
        <Surface>No tasks configured. The agent will run with an empty list until tasks are added.</Surface>
      ) : null}
      {tasks.map((task, index) => (
        <Surface key={task.id}>
          <Input
            label="ID"
            onChange={(event) => updateTask(props, tasks, index, { id: event.target.value })}
            value={task.id}
          />
          <Input
            label="Description"
            onChange={(event) => updateTask(props, tasks, index, { description: event.target.value })}
            value={task.description}
          />
          <IconButton
            aria-label={`Remove task ${task.id}`}
            icon="trash-2"
            onClick={() => removeTask(props, tasks, index)}
            type="button"
          />
        </Surface>
      ))}
    </Section>
  );
}

function updateTask(
  props: CapabilityEditorProps<ProgressiveTaskListConfig>,
  tasks: ProgressiveTaskListTaskInput[],
  index: number,
  patch: Partial<ProgressiveTaskListTaskInput>,
) {
  const next = tasks.map((task, i) => (i === index ? { ...task, ...patch } : task));
  props.onChange({ ...props.config, tasks: next });
}

function removeTask(
  props: CapabilityEditorProps<ProgressiveTaskListConfig>,
  tasks: ProgressiveTaskListTaskInput[],
  index: number,
) {
  const next = tasks.filter((_, i) => i !== index);
  props.onChange({ ...props.config, tasks: next });
}

function addTask(props: CapabilityEditorProps<ProgressiveTaskListConfig>, tasks: ProgressiveTaskListTaskInput[]) {
  const nextId = `task-${tasks.length + 1}`;
  const next: ProgressiveTaskListTaskInput[] = [...tasks, { id: nextId, description: '' }];
  props.onChange({ ...props.config, tasks: next });
}
