import { AgentExitHook, ToolResponse } from '../../agent';
import type { AgentStatus } from '../../agent/types';
import { Cell, type DataCells } from '../../thread';
import { AgentCapability } from '../agent-capability';
import systemPrompt from './prompts/system.md?raw';
import { buildCompleteTaskTool } from './tools/complete-task/handler';
import { buildFailTaskTool } from './tools/fail-task/handler';
import { buildSubmitDeliverableTool } from './tools/submit-deliverable/handler';
import type { TaskLifecycleCapabilityConfig } from './utils/task-lifecycle-types';

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
  private readonly additionalContextSlot = this.useState<string>('additionalContext', '');
  private readonly requiredDeliverableIdsSlot = this.useState<string[]>('requiredDeliverableIds', []);
  private readonly submittedDeliverableIdsSlot = this.useState<string[]>('submittedDeliverableIds', []);
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
    if (typeof config.additionalContext === 'string') {
      this.additionalContextSlot.set(config.additionalContext);
    }
    const name = this.taskNameSlot.value;
    if (name.length === 0) {
      return;
    }
    void this.injectTaskAssignmentContext();
  }

  /**
   * Exposes the completion tools to the model. Each tool routes through the
   * owner-aware bridge method; if the agent's id no longer matches the task
   * owner (e.g. user undelegated), the call surfaces a `TaskOwnershipError`
   * back to the model so it can revise its plan.
   */
  public override hookOnRegister(_config: TaskLifecycleCapabilityConfig) {
    return {
      system: systemPrompt,
      tools: [buildSubmitDeliverableTool(this), buildCompleteTaskTool(this), buildFailTaskTool(this)],
    };
  }

  public async submitDeliverable(input: {
    deliverableId: string;
    payload: { type: 'text'; content: string } | { type: 'pr_url'; url: string };
  }) {
    const submission = await this.bridge.taskBoards.submitDeliverable({
      agentId: this.agent.agentId,
      taskId: this.requireTaskId(),
      deliverableId: input.deliverableId,
      payload: input.payload,
    });
    this.markDeliverableSubmitted(submission.deliverableId);
    return ToolResponse.success([Cell.text(`Submitted deliverable ${submission.deliverableId}.`)]);
  }

  public async completeTask(reason: string | undefined) {
    await this.ensureDeliverableStateLoaded();
    const missing = this.requiredDeliverableIdsSlot.value.filter(
      (id) => !this.submittedDeliverableIdsSlot.value.includes(id),
    );
    if (missing.length > 0) {
      return ToolResponse.error(`Cannot complete: deliverables not yet submitted: ${missing.join(', ')}`, [
        Cell.text(`Cannot complete: deliverables not yet submitted: ${missing.join(', ')}`),
      ]);
    }
    await this.bridge.taskBoards.setOwnedTaskStatus({
      agentId: this.agent.agentId,
      taskId: this.requireTaskId(),
      status: 'success',
      reason: reason ?? 'agent marked task complete',
    });
    this.completedSlot.set(true);
    return ToolResponse.success([Cell.text('Task marked as success. You can exit now.')]);
  }

  public async failTask(reason: string) {
    await this.bridge.taskBoards.setOwnedTaskStatus({
      agentId: this.agent.agentId,
      taskId: this.requireTaskId(),
      status: 'failure',
      reason,
    });
    this.completedSlot.set(true);
    return ToolResponse.success([Cell.text('Task marked as failure. You can exit now.')]);
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
   * the capability cannot guarantee the bridge is still wired at that point.
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
    void this.bridge.taskBoards
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

  private async injectTaskAssignmentContext(): Promise<void> {
    await this.ensureDeliverableStateLoaded();
    const name = this.taskNameSlot.value;
    const description = this.taskDescriptionSlot.value.trim();
    const additionalContext = this.additionalContextSlot.value.trim();
    const deliverables = await this.bridge.taskBoards.listTaskDeliverables({ taskId: this.requireTaskId() });
    const cells: DataCells = [Cell.header2(`Task: ${name}`)];
    if (description.length > 0) {
      cells.push(Cell.text(description));
    }
    if (additionalContext.length > 0) {
      cells.push(Cell.text(additionalContext));
    }
    if (deliverables.length > 0) {
      const lines = ['Deliverables required (submit each via the submit-deliverable tool):'];
      for (const deliverable of deliverables) {
        lines.push(`  - id=${deliverable.id}  name=${deliverable.name}  type=${deliverable.type}`);
        if (deliverable.description.trim().length > 0) {
          lines.push(`    ${deliverable.description.trim()}`);
        }
      }
      cells.push(Cell.text(lines.join('\n')));
    }
    this.agent.addUserContext('Task Assignment', cells);
  }

  private async ensureDeliverableStateLoaded(): Promise<void> {
    const taskId = this.requireTaskId();
    const [deliverables, submissions] = await Promise.all([
      this.bridge.taskBoards.listTaskDeliverables({ taskId }),
      this.bridge.taskBoards.listTaskDeliverableSubmissions({ taskId }),
    ]);
    this.requiredDeliverableIdsSlot.set(deliverables.map((deliverable) => deliverable.id));
    this.submittedDeliverableIdsSlot.set(submissions.map((submission) => submission.deliverableId));
  }

  private markDeliverableSubmitted(deliverableId: string): void {
    if (this.submittedDeliverableIdsSlot.value.includes(deliverableId)) {
      return;
    }
    this.submittedDeliverableIdsSlot.set([...this.submittedDeliverableIdsSlot.value, deliverableId]);
  }

  private requireTaskId(): string {
    const taskId = this.taskIdSlot.value;
    if (taskId.length === 0) {
      throw new Error('task-lifecycle capability has no taskId configured.');
    }
    return taskId;
  }
}
