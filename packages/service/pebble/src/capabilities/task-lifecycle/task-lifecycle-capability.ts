import { AgentExitHook, NativeTool, ToolResponse } from '../../agent';
import type { TaskBoardRunner } from '../../agent/task-board-runner';
import type { AgentStatus } from '../../agent/types';
import { Cell } from '../../thread';
import { AgentCapability } from '../agent-capability';
import { getCapabilityRunners } from '../runners';
import { completeTaskSchema, failTaskSchema } from './task-lifecycle-schemas';
import type { TaskLifecycleCapabilityConfig } from './task-lifecycle-types';

/**
 * Binds an agent to a specific task for the lifetime of the run.
 *
 * Exposes two tools (`complete-task`, `fail-task`) that route through the
 * owner-aware path on the daemon and refuse to mutate any other task. Blocks
 * the agent from exiting until one of those tools succeeds and mirrors the
 * agent's `running`/`waiting` status onto the task while the run is open.
 */
export class TaskLifecycleCapability extends AgentCapability<TaskLifecycleCapabilityConfig> {
  public readonly id = 'task-lifecycle';
  public readonly description = 'Binds an agent to a specific task and gates exit on completion.';

  private readonly taskIdSlot = this.useState<string>('taskId', '');
  private readonly boardIdSlot = this.useState<string>('boardId', '');
  private readonly taskNameSlot = this.useState<string>('taskName', '');
  private readonly taskDescriptionSlot = this.useState<string>('taskDescription', '');
  // `completed` flips to true once the agent successfully calls complete-task
  // or fail-task. Stored so the gate survives rehydration.
  private readonly completedSlot = this.useState<boolean>('completed', false);

  /**
   * Captures the task this capability is bound to and injects the task name +
   * description into the agent's conversation thread as a user-context block
   * so the model has structured task info on every turn (instead of relying
   * on a one-shot kickoff message). Only runs on fresh launches; rehydration
   * skips initialize and the cells from the prior run are already replayed.
   */
  public override initialize(config: TaskLifecycleCapabilityConfig): void {
    if (typeof config.taskId === 'string') {
      this.taskIdSlot.set(config.taskId);
    }
    if (typeof config.boardId === 'string') {
      this.boardIdSlot.set(config.boardId);
    }
    if (typeof config.taskName === 'string') {
      this.taskNameSlot.set(config.taskName);
    }
    if (typeof config.taskDescription === 'string') {
      this.taskDescriptionSlot.set(config.taskDescription);
    }
    const name = this.taskNameSlot.value;
    if (name.length === 0) {
      return;
    }
    const description = this.taskDescriptionSlot.value.trim();
    const cells =
      description.length > 0
        ? [Cell.header2(`Task: ${name}`), Cell.text(description)]
        : [Cell.header2(`Task: ${name}`)];
    this.agent.addUserContext('Task Assignment', cells);
  }

  /**
   * Exposes the completion tools to the model. Each tool routes through the
   * owner-aware runner method; if the agent's id no longer matches the task
   * owner (e.g. user undelegated), the call surfaces a `TaskOwnershipError`
   * back to the model so it can revise its plan.
   */
  public override hookOnRegister(_config: TaskLifecycleCapabilityConfig) {
    return {
      tools: [
        new NativeTool({
          description: 'Mark the assigned task as successfully complete.',
          name: 'complete-task',
          schema: completeTaskSchema,
        }).onInvoke(async (input) => {
          await this.runner().setOwnedTaskStatus({
            agentId: this.agent.agentId,
            taskId: this.requireTaskId(),
            status: 'success',
            reason: input.reason ?? 'agent marked task complete',
          });
          this.completedSlot.set(true);
          return ToolResponse.success([Cell.text('Task marked as success. You can exit now.')]);
        }),
        new NativeTool({
          description: 'Mark the assigned task as failed. Use only when the task cannot be completed.',
          name: 'fail-task',
          schema: failTaskSchema,
        }).onInvoke(async (input) => {
          await this.runner().setOwnedTaskStatus({
            agentId: this.agent.agentId,
            taskId: this.requireTaskId(),
            status: 'failure',
            reason: input.reason,
          });
          this.completedSlot.set(true);
          return ToolResponse.success([Cell.text('Task marked as failure. You can exit now.')]);
        }),
      ],
    };
  }

  /**
   * Blocks exit until the agent reports task success or failure via the
   * lifecycle tools. The reason is surfaced to the model so it knows the
   * next loop iteration is forced and why.
   */
  public override hookOnAgentExit() {
    if (this.completedSlot.value) {
      return AgentExitHook.permitExit();
    }
    return AgentExitHook.denyExit('Mark this task complete or failed before exiting.');
  }

  /**
   * Mirrors the agent's lifecycle status onto the bound task.
   *
   * `running → waiting` flips the task to `waiting`; `waiting → running`
   * flips it back to `working`. Terminal agent edges (failed/offline) are
   * left to the existing `syncOwnedTasksFromAgentStatus` safety net since
   * the capability cannot guarantee the runner is still wired at that point.
   */
  public override hookOnAgentStatusChange(previous: AgentStatus, next: AgentStatus): void {
    if (this.completedSlot.value) {
      return;
    }
    if (previous === 'running' && next === 'waiting') {
      this.markTaskStatus('waiting', 'agent waiting');
      return;
    }
    if (previous === 'waiting' && next === 'running') {
      this.markTaskStatus('working', 'agent resumed');
    }
  }

  private markTaskStatus(status: 'working' | 'waiting', reason: string): void {
    const taskId = this.taskIdSlot.value;
    if (taskId.length === 0) {
      return;
    }
    void this.runner()
      .setOwnedTaskStatus({
        agentId: this.agent.agentId,
        taskId,
        status,
        reason,
      })
      .catch(() => {
        // Status mirroring is best-effort; ownership transfers or terminal
        // state on the task can legitimately reject the call.
      });
  }

  private runner(): TaskBoardRunner {
    const runner = getCapabilityRunners(this.agent).taskBoard;
    if (runner === undefined) {
      throw new Error('task-board runner is not installed.');
    }
    return runner;
  }

  private requireTaskId(): string {
    const taskId = this.taskIdSlot.value;
    if (taskId.length === 0) {
      throw new Error('task-lifecycle capability has no taskId configured.');
    }
    return taskId;
  }
}
