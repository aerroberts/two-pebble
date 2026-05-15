import type { ComponentType } from 'react';
import { ProgressiveTaskListEditor } from './editors/progressive-task-list-editor';
import { TaskBoardAccessEditor } from './editors/task-board-access-editor';
import type { CapabilityConfigValue, ProgressiveTaskListConfig, TaskBoardAccessConfig } from './types';

export interface CapabilityEditorProps<TConfig extends CapabilityConfigValue> {
  config: TConfig;
  onChange: (next: TConfig) => void;
}

export interface KnownCapability<TConfig extends CapabilityConfigValue> {
  id: string;
  title: string;
  description: string;
  defaultConfig: TConfig;
  /**
   * Optional inline editor. Capabilities without configurable parameters
   * (e.g. workspace-access) can omit this; the row shows just the
   * Add/Remove button without an editor body.
   */
  Editor?: ComponentType<CapabilityEditorProps<TConfig>>;
}

/**
 * Static list of capabilities the UI knows how to display and configure.
 * Excludes `sub-agent`, which has its own dedicated section in the
 * registry editor — sub-agents aren't really "capabilities" from the
 * user's mental model. Each entry maps to a real capability id pebble's
 * `capabilityRegistry` knows about; adding a new in-tree capability
 * means adding a new entry here too.
 */
export const knownCapabilities: KnownCapability<CapabilityConfigValue>[] = [
  {
    id: 'progressive-task-list',
    title: 'To-do list',
    description: 'Give the agent a structured task list with completion tools and per-turn status reminders.',
    defaultConfig: { tasks: [] } as ProgressiveTaskListConfig,
    Editor: ProgressiveTaskListEditor as object as ComponentType<CapabilityEditorProps<CapabilityConfigValue>>,
  },
  {
    id: 'workspace-access',
    title: 'Workspace access',
    description:
      "Expose workspace-scoped shell and file tools (bash, read, create, write, edit, patch) to the agent. All paths resolve inside the agent's workspace.",
    defaultConfig: {},
  },
  {
    id: 'document-writer',
    title: 'Document writer',
    description:
      'Let the agent create, update, read, and list documents. Documents the agent touches are back-linked to it automatically so you can trace authorship from the document editor.',
    defaultConfig: {},
  },
  {
    id: 'task-board-access',
    title: 'Task board access',
    description:
      'Give the agent CRUD access to a single durable task board. The board id is locked at registration — describe, create, update, delete, dependency, and event tools all operate on the chosen board only.',
    defaultConfig: { boardId: '' } as TaskBoardAccessConfig,
    Editor: TaskBoardAccessEditor as object as ComponentType<CapabilityEditorProps<CapabilityConfigValue>>,
  },
];
