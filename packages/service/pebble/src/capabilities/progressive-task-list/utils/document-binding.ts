import type { DocumentTodo } from '@two-pebble/datatypes';
import type { Agent } from '../../../agent/agent';
import { getAgentBridge } from '../../agent-bridge';
import type { Task, TaskStatus } from './types';

export interface DocumentBindingSyncInput {
  agent: Agent;
  capabilityId: string;
  documentId: string;
  tasks: Task[];
}

export interface DocumentBindingSyncResult {
  tasks: Task[];
  changed: boolean;
}

export interface DocumentBindingMirrorInput {
  agent: Agent;
  capabilityId: string;
  documentId: string;
  taskId: string;
  status: 'completed' | 'invalid';
  completionType: 'manual' | 'automatic' | null;
}

interface TraceEmitInput {
  agent: Agent;
  capabilityId: string;
  name: string;
  message: string;
}

interface ApplyTodosInput {
  tasks: Task[];
  todos: DocumentTodo[];
}

/**
 * Reads the bound document via the installed `documentWriter` bridge and
 * reconciles its embedded todos with the capability's in-memory task
 * list. Returns the next task array plus a boolean signalling whether
 * any task moved — callers persist only on change to keep traces tight.
 */
export async function syncTasksFromDocumentBinding(
  input: DocumentBindingSyncInput,
): Promise<DocumentBindingSyncResult> {
  const runner = getAgentBridge(input.agent).documentWriter;
  if (runner === undefined) {
    return { tasks: input.tasks, changed: false };
  }
  let todos: DocumentTodo[] = [];
  try {
    todos = await runner.readDocumentTodos({ id: input.documentId });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    emitBindingTrace({ agent: input.agent, capabilityId: input.capabilityId, name: 'documentSyncError', message });
    return { tasks: input.tasks, changed: false };
  }
  return applyTodos({ tasks: input.tasks, todos });
}

/**
 * Mirrors a task status change back into the bound document. Errors are
 * logged via a trace and swallowed: the in-memory task already moved
 * and the next turn will self-heal via `syncTasksFromDocumentBinding`.
 */
export async function mirrorStatusToDocumentBinding(input: DocumentBindingMirrorInput): Promise<void> {
  const runner = getAgentBridge(input.agent).documentWriter;
  if (runner === undefined) {
    return;
  }
  try {
    await runner.applyTodoStatus({
      id: input.documentId,
      todoId: input.taskId,
      status: input.status,
      ...(input.completionType === null ? {} : { completionType: input.completionType }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    emitBindingTrace({ agent: input.agent, capabilityId: input.capabilityId, name: 'documentMirrorError', message });
  }
}

function applyTodos(input: ApplyTodosInput): DocumentBindingSyncResult {
  let changed = false;
  const nextById = new Map(input.tasks.map((task) => [task.id, task]));
  for (const todo of input.todos) {
    const current = nextById.get(todo.id);
    if (current !== undefined) {
      const updated = reconcileExistingTask(current, todo);
      if (updated !== current) {
        nextById.set(todo.id, updated);
        changed = true;
      }
      continue;
    }
    nextById.set(todo.id, buildNewTask(todo));
    changed = true;
  }
  return { tasks: Array.from(nextById.values()), changed };
}

function reconcileExistingTask(task: Task, todo: DocumentTodo): Task {
  if (todo.status !== 'completed' && todo.status !== 'invalid') {
    return task;
  }
  if (task.status === todo.status) {
    return task;
  }
  if (todo.status === 'completed') {
    return { ...task, status: 'completed', completionReason: 'Marked complete in document.' };
  }
  return { ...task, status: 'invalid', invalidReason: 'Marked invalid in document.' };
}

function buildNewTask(todo: DocumentTodo): Task {
  const description = todo.text.length === 0 ? '(empty task)' : todo.text;
  const status: TaskStatus = todo.status === 'open' ? 'pending' : todo.status;
  const base: Task = { id: todo.id, description, status, openedOnTurn: 0 };
  if (todo.status === 'completed') {
    return { ...base, completionReason: 'Marked complete in document.' };
  }
  if (todo.status === 'invalid') {
    return { ...base, invalidReason: 'Marked invalid in document.' };
  }
  return base;
}

function emitBindingTrace(input: TraceEmitInput): void {
  input.agent.emit('trace', {
    type: 'state-snapshot',
    data: { capabilityId: input.capabilityId, name: input.name, value: input.message },
  });
}
