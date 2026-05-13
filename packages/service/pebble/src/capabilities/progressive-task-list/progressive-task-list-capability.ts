import type { AgentExitHookResult } from '../../agent';
import { AgentCapability, AgentExitHook, EarlyExit } from '../../agent';
import { Cell } from '../../thread';
import type { TaskListUpdateTask } from '../../traces';
import { ProgressiveTaskListTaskAlreadyTerminalError } from './progressive-task-list-task-already-terminal-error';
import { ProgressiveTaskListTaskBlockedError } from './progressive-task-list-task-blocked-error';
import { ProgressiveTaskListTaskNotFoundError } from './progressive-task-list-task-not-found-error';
import type { TaskListUpdateData } from './progressive-task-list-trace-types';
import { buildMarkTaskCompleteTool } from './tools/mark-task-complete/handler';
import { buildMarkTaskInvalidTool } from './tools/mark-task-invalid/handler';
import type {
  ProgressiveTaskListCapabilityParams,
  ProgressiveTaskListStatus,
  Task,
  TaskInput,
  TaskStatus,
  TaskUpdater,
} from './types';

/**
 * Capability for managing a flat list of tasks with optional dependencies.
 *
 * State (tasks, last-emitted statuses, turn counter) lives in `useState`
 * slots so a daemon restart can replay the latest snapshot per slot and
 * reconstruct the runtime view exactly. Tasks declared in config are
 * applied through `initialize`, which is called only on fresh launch.
 */
export class ProgressiveTaskListCapability extends AgentCapability<ProgressiveTaskListCapabilityParams> {
  public readonly description = 'Manages a progressive task list and exposes task completion tools.';
  public readonly id = 'progressive-task-list';
  private readonly tasksSlot = this.useState<Task[]>('tasks', []);
  private readonly emittedStatusesSlot = this.useState<Record<string, TaskStatus>>('lastEmittedTaskStatuses', {});
  private readonly turnCounterSlot = this.useState<number>('turnCounter', 0);

  /**
   * Seeds the task list from the user-provided config. The agent calls
   * this only on fresh launch — on rehydrate the tasks slot is replayed
   * from the latest persisted snapshot instead.
   */
  public override initialize(config: ProgressiveTaskListCapabilityParams): void {
    for (const task of config.tasks ?? []) {
      this.addTask(task);
    }
  }

  /**
   * Registers the task status tools exposed to the model. The tools
   * mutate task state and emit trace updates through this capability.
   */
  public override hookOnRegister() {
    return {
      tools: [buildMarkTaskCompleteTool(this), buildMarkTaskInvalidTool(this)],
    };
  }

  /**
   * Computes the visible task set and prompt text for the next model turn.
   * The result also drives early-exit and attempted-exit decisions.
   */
  private status(): ProgressiveTaskListStatus {
    const tasks = this.tasksSlot.value;
    const openTasks = tasks.filter((t) => t.status === 'pending' || t.status === 'open');
    const visibleTasks = tasks.filter((t) => t.status === 'open');
    const completedTasks = tasks.filter((t) => t.status === 'completed');
    const invalidTasks = tasks.filter((t) => t.status === 'invalid');
    const allTasksTerminal = openTasks.length === 0 && visibleTasks.length === 0;
    const terminalTasks = [...completedTasks, ...invalidTasks];
    const terminalTasksString = terminalTasks.length === 0 ? 'none' : terminalTasks.map((task) => task.id).join(', ');
    const visibleTasksString =
      visibleTasks.length === 0 ? 'none' : visibleTasks.map((task) => `${task.id} - ${task.description}`).join('\n');
    const statusPrompt = allTasksTerminal
      ? `All tasks are terminal. Stop task work and exit; there are no current tasks to continue. Terminal tasks: ${terminalTasksString}.`
      : `Current actionable tasks, and only these tasks: ${visibleTasksString}. Do not continue pending, hidden, completed, invalid, or automatically completed tasks. Terminal tasks already closed: ${terminalTasksString}.`;
    return { allTasksTerminal, openTasks, visibleTasks, statusPrompt, completedTasks, invalidTasks };
  }

  /**
   * Reads a task status by id and fails loudly when dependencies reference
   * unknown tasks. Dependency checks rely on this staying strict.
   */
  private taskStatus(taskId: string) {
    const task = this.tasksSlot.value.find((t) => t.id === taskId);
    if (!task) throw new ProgressiveTaskListTaskNotFoundError(taskId);
    return task.status;
  }

  /**
   * Create a new task and add it to the task list.
   */
  public addTask(task: TaskInput) {
    const next: Task = {
      id: task.id,
      description: task.description,
      status: 'pending',
      openedOnTurn: 0,
      ...(task.autocompleteTurns === undefined ? {} : { autocompleteTurns: task.autocompleteTurns }),
      ...(task.dependsOn === undefined ? {} : { dependsOn: task.dependsOn }),
      ...(task.hiddenUntilActive === undefined ? {} : { hiddenUntilActive: task.hiddenUntilActive }),
    };
    this.tasksSlot.set([...this.tasksSlot.value, next]);
  }

  /**
   * Marks a task as complete successfully.
   * Errors if the task is not found or already terminal.
   */
  public completeTaskSuccessfully(taskId: string, completionReason: string | undefined) {
    const tasks = this.tasksSlot.value;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) throw new ProgressiveTaskListTaskNotFoundError(taskId);
    if (task.status === 'completed') throw new ProgressiveTaskListTaskAlreadyTerminalError(taskId, task.status);
    if (task.dependsOn) {
      const dependencyStatus = this.taskStatus(task.dependsOn);
      if (dependencyStatus !== 'completed' && dependencyStatus !== 'invalid') {
        throw new ProgressiveTaskListTaskBlockedError(taskId, task.dependsOn);
      }
    }
    this.replaceTask(taskId, (current) => ({
      ...current,
      status: 'completed',
      ...(completionReason === undefined ? {} : { completionReason }),
    }));
    this.emitTaskListUpdateIfChanged();
  }

  /**
   * Marks a task as complete unsuccessfully.
   * Errors if the task is not found or already terminal.
   */
  public completeTaskUnsuccessfully(taskId: string, invalidReason: string) {
    const tasks = this.tasksSlot.value;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) throw new ProgressiveTaskListTaskNotFoundError(taskId);
    if (task.status === 'invalid') throw new ProgressiveTaskListTaskAlreadyTerminalError(taskId, task.status);
    this.replaceTask(taskId, (current) => ({ ...current, status: 'invalid', invalidReason }));
    this.emitTaskListUpdateIfChanged();
  }

  /**
   * Cancels every non-terminal task by marking it invalid with the given
   * reason. Returns the IDs of the tasks that were cancelled.
   */
  public cancelAllOpenTasks(reason: string): string[] {
    const cancelled: string[] = [];
    const next = this.tasksSlot.value.map((task) => {
      if (task.status === 'pending' || task.status === 'open') {
        cancelled.push(task.id);
        return { ...task, status: 'invalid' as const, invalidReason: reason };
      }
      return task;
    });
    this.tasksSlot.set(next);
    this.emitTaskListUpdateIfChanged();
    return cancelled;
  }

  /**
   * Builds the durable task-list trace payload from the current in-memory
   * state and advances the status baseline so later traces only list
   * changed tasks.
   */
  private buildTaskListUpdate(): TaskListUpdateData {
    const lastStatuses = this.emittedStatusesSlot.value;
    const tasks = this.tasksSlot.value.map((task): TaskListUpdateTask => {
      const statusReason = this.getTaskStatusReason(task);
      const completionType = task.status === 'completed' ? (task.autoCompleted ? 'automatic' : 'manual') : undefined;
      return {
        id: task.id,
        status: task.status,
        description: task.description,
        ...(statusReason === undefined ? {} : { statusReason }),
        ...(completionType === undefined ? {} : { completionType }),
      };
    });
    const changes = tasks.flatMap((task) => {
      const oldStatus = lastStatuses[task.id] ?? null;
      if (oldStatus === task.status) return [];
      return [{ id: task.id, oldStatus, newStatus: task.status }];
    });
    const nextStatuses: Record<string, TaskStatus> = {};
    for (const task of tasks) nextStatuses[task.id] = task.status;
    this.emittedStatusesSlot.set(nextStatuses);
    return { tasks, changes };
  }

  /**
   * Emits a task-list trace only when task statuses changed since the
   * last emission. Direct task mutations before capability registration
   * are intentionally silent.
   */
  private emitTaskListUpdateIfChanged() {
    if (this.agent === undefined) return;
    const taskListUpdate = this.buildTaskListUpdate();
    if (taskListUpdate.changes.length > 0) {
      this.agent.emit('trace', { type: 'task-list-update', data: taskListUpdate });
    }
  }

  /**
   * Returns the human reason attached to a terminal task status.
   */
  private getTaskStatusReason(task: Task) {
    if (task.status === 'completed') return task.completionReason;
    if (task.status === 'invalid') return task.invalidReason;
    return undefined;
  }

  /**
   * Hook triggered automatically before each agent turn. Handles
   * auto-completion, reveals hidden tasks, and emits status updates.
   */
  public override hookBeforeAgentTurn() {
    const turnCounter = this.turnCounterSlot.value;
    const autocompleteIds = this.getAutocompleteableTasks().map((t) => t.id);
    const revealIds = this.getRevealableTasks().map((t) => t.id);
    if (autocompleteIds.length > 0 || revealIds.length > 0) {
      const next = this.tasksSlot.value.map((task) => {
        if (autocompleteIds.includes(task.id)) {
          return {
            ...task,
            status: 'completed' as const,
            autoCompleted: true,
            completionReason: `Automatically completed after ${task.autocompleteTurns} open turns.`,
          };
        }
        if (revealIds.includes(task.id)) {
          return { ...task, status: 'open' as const, openedOnTurn: turnCounter };
        }
        return task;
      });
      this.tasksSlot.set(next);
    }
    const status = this.status();
    this.turnCounterSlot.set(turnCounter + 1);
    this.emitTaskListUpdateIfChanged();
    const tasks = this.tasksSlot.value;
    const autocompleteTasks = tasks.filter((t) => autocompleteIds.includes(t.id));
    const revealTasks = tasks.filter((t) => revealIds.includes(t.id));
    this.agent.addUserContext('Task List', [
      Cell.header2('Task List'),
      Cell.text(
        'You are managed by a task list, make sure to work on tasks and mark them as complete or invalid as you go.',
      ),
      ...autocompleteTasks.map((t) =>
        Cell.text(
          `Task ${t.id} hit its turn limit and was closed automatically. Stop working on it immediately and do not use tools for it again; move on to the current actionable task list below.`,
        ),
      ),
      ...revealTasks.map((t) => Cell.text(`The following task is now available to you: ${t.id} - ${t.description}`)),
      Cell.text(status.statusPrompt),
    ]);
  }

  /**
   * Finds pending tasks that should become actionable for the next turn.
   */
  private getRevealableTasks() {
    const revealTasks: Task[] = [];
    for (const task of this.tasksSlot.value) {
      if (this.taskStatus(task.id) !== 'pending') continue;
      if (!task.hiddenUntilActive) {
        revealTasks.push(task);
        continue;
      }
      if (!task.dependsOn) {
        revealTasks.push(task);
        continue;
      }
      const dependencyStatus = this.taskStatus(task.dependsOn);
      if (dependencyStatus === 'completed' || dependencyStatus === 'invalid') revealTasks.push(task);
    }
    return revealTasks;
  }

  /**
   * Finds open tasks that exceeded their configured turn budget.
   */
  private getAutocompleteableTasks() {
    const autocompleteableTasks: Task[] = [];
    const turnCounter = this.turnCounterSlot.value;
    for (const task of this.tasksSlot.value) {
      if (task.status !== 'open' || task.autocompleteTurns === undefined) continue;
      const turnsActive = turnCounter - task.openedOnTurn;
      if (turnsActive >= task.autocompleteTurns) autocompleteableTasks.push(task);
    }
    return autocompleteableTasks;
  }

  /**
   * Hook triggered automatically by the system to assess if this
   * capability is complete and the agent can exit.
   */
  public override hookOnEarlyExit() {
    const status = this.status();
    if (status.allTasksTerminal) return EarlyExit.possible(status.statusPrompt);
    return EarlyExit.notPossible(status.statusPrompt);
  }

  /**
   * Hook triggered automatically by the system when the agent requests
   * exiting. We block exit until all tasks are terminal.
   */
  public override hookOnAgentExit(): AgentExitHookResult {
    const status = this.status();
    if (status.allTasksTerminal) return AgentExitHook.permitExit();
    return AgentExitHook.denyExit(status.statusPrompt);
  }

  private replaceTask(taskId: string, update: TaskUpdater) {
    this.tasksSlot.set(this.tasksSlot.value.map((task) => (task.id === taskId ? update(task) : task)));
  }
}
