'use client';

import * as RadixSelect from '@radix-ui/react-select';
import type { SelectOption } from '../../input/select/select';
import { SelectContent } from '../../input/select/select-content';
import { TaskStatusIcon } from '../task-status-icon/task-status-icon';
import type { TaskStatusIconStatus } from '../task-status-icon/types';

export type SettableTaskStatus = 'working' | 'waiting' | 'success' | 'failure';

const SETTABLE_OPTIONS: SelectOption[] = [
  { value: 'working', label: 'Working', icon: <TaskStatusIcon status="working" size="sm" /> },
  { value: 'waiting', label: 'Waiting', icon: <TaskStatusIcon status="waiting" size="sm" /> },
  { value: 'success', label: 'Done', icon: <TaskStatusIcon status="success" size="sm" /> },
  { value: 'failure', label: 'Failed', icon: <TaskStatusIcon status="failure" size="sm" /> },
];

export interface TaskStatusIconSelectProps {
  status: TaskStatusIconStatus;
  onChange: (status: SettableTaskStatus) => void;
  ariaLabel?: string;
}

/**
 * Renders the task status icon as the trigger for a status-change dropdown.
 * Clicking or activating the icon opens a menu of settable statuses, so the
 * icon doubles as both indicator and control with no redundant chevron.
 */
export function TaskStatusIconSelect(props: TaskStatusIconSelectProps) {
  return (
    <RadixSelect.Root value={props.status} onValueChange={(value) => props.onChange(value as SettableTaskStatus)}>
      <RadixSelect.Trigger
        aria-label={props.ariaLabel ?? 'Change task status'}
        className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md p-0.5 outline-none transition-colors hover:bg-surface-hover focus-visible:ring-1 focus-visible:ring-accent"
      >
        <TaskStatusIcon status={props.status} size="sm" />
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <SelectContent options={SETTABLE_OPTIONS} />
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
