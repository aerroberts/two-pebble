import type { AgentSignal } from '../../bridge';
import type { AgentCapability } from '../../capabilities/agent-capability';
import type { ModelProvider } from '../../providers/index';
import type { ProviderOutputBlock, ProviderResult } from '../../providers/types';
import { Cell, ConversationThread, Event } from '../../thread/index';
import type { PebbleJsonValue } from '../../types';
import { Agent } from '../agent';
import type { ToolResponseResult } from '../hooks/tool-response';
import type { AgentTool } from '../tools/agent-tool';
import type { ToolInput, ToolInputRecord } from '../tools/tool-input';
import type {
  AgentStatus,
  AgentToolRegistration,
  InvokeModelResult,
  PebbleAgentConfig,
  PebbleToolCall,
  ThreadCellInput,
} from '../types';
import type { ToolResultThreadEventInput } from './pebble-agent-runtime-types';

const PEBBLE_SYSTEM_PROMPT = [
  'You are a Pebble agent — a structured agent running inside the Two Pebble runtime.',
  '',
  'The runtime composes your context as a sequence of role-tagged cells: a Pebble system prompt (this one), an Agent system prompt that defines your specific role, optional Capability system prompts that describe additional capabilities available to you, and ongoing user/assistant messages.',
  '',
  'You interact with the world exclusively through the tools registered against your capabilities. The runtime relays your tool calls, returns results, and tracks task state on your behalf. Your job is to follow your Agent system prompt, use the available tools accurately, and communicate clearly.',
].join('\n');

/**
 * Pebble agents are those built into our system to allow higher level actions and orchestration.
 * They allow capabilities to be registered and tools to be registered and used by the agent.
 */
export class PebbleAgent extends Agent {
  // Each pebble agent owns a conversation thread which is the context sent to the model
  private readonly thread: ConversationThread;

  // Each agent also has a provider which exposes model access
  private readonly provider: ModelProvider;
  private readonly initialSystemPrompt: string;
  private readonly restoredFromThread: boolean;
  private systemPromptInitialized = false;

  // Capabilties are the ties to the world that the agent needs to do anything of value
  private readonly capabilities: AgentCapability[] = [];
  private readonly agentTools: AgentToolRegistration[] = [];

  // Set by `stop` so the agentic loop exits at the next boundary without
  // queuing another model call. Cleared every time the loop reads it so
  // a later message can run a fresh loop on the same instance.
  private stopRequested = false;
  private stopReason = '';

  public constructor(config: PebbleAgentConfig) {
    super({
      agentId: config.agentId,
      bridge: config.bridge,
      description: config.description,
      name: config.name,
      workspacePath: config.workspacePath,
    });
    this.provider = config.provider;
    this.initialSystemPrompt = config.systemPrompt ?? '';
    this.restoredFromThread = config.restoredThread !== undefined;
    this.thread =
      config.restoredThread === undefined
        ? new ConversationThread({})
        : new ConversationThread({ cells: config.restoredThread.cells, threadId: config.restoredThread.threadId });
    this.thread.onCell((cell) => {
      this.emit('threadMessage', {
        threadId: this.thread.threadId,
        ...cell,
      });
    });

    this.on('message', () => this.onIncomingMessage());

    // Status
    this.changeStatus('idle', 'agent initialized');
  }

  /**
   * Appends the registry-level system prompt to a fresh agent thread.
   *
   * The daemon calls this after installing thread persistence listeners so
   * the prompt is stored in the durable conversation snapshot. Rehydrated
   * agents already have their original system cell in the restored thread.
   */
  public initializeSystemPrompt(): void {
    if (this.restoredFromThread || this.systemPromptInitialized) {
      return;
    }
    this.thread.pushSystem(
      'Pebble System Prompt',
      Cell.header1('Pebble System Prompt'),
      Cell.text(PEBBLE_SYSTEM_PROMPT),
    );
    const prompt = this.initialSystemPrompt.trim();
    if (prompt.length === 0) {
      this.systemPromptInitialized = true;
      return;
    }
    this.thread.pushSystem('Agent System Prompt', Cell.header1('Agent System Prompt'), Cell.text(prompt));
    this.systemPromptInitialized = true;
  }

  /**
   * Rehydrates a capability from persisted slot state.
   * Initialization is skipped because the stored state is the source of
   * truth; registration hooks run only to rebuild runtime tools.
   */
  public hydrateCapability<TConfig extends PebbleJsonValue>(
    capability: AgentCapability<TConfig>,
    config: TConfig,
    state: Map<string, PebbleJsonValue>,
  ) {
    // Add to list of known
    this.capabilities.push(capability);

    // Setup the capability to it has a reference to the agent
    capability.attach(this);

    // Restore the state of the capability from storage, no initialization hook is run
    capability.restoreState(state);

    // Rebuild tools for this capability
    const registration = capability.hookOnRegister(config);
    for (const tool of registration.tools) {
      this.registerTool(capability, tool);
    }

    this.emit('trace', {
      type: 'capability-hydrate',
      data: {
        capabilityId: capability.id,
        description: capability.description,
        name: capability.id,
        tools: this.toolsForCapabilityTrace(registration.tools),
      },
    });
  }

  /**
   * Registers a fresh capability for this run.
   * Config initializes default state before the capability exposes tools
   * and emits a registration trace.
   */
  public registerCapability<TConfig extends PebbleJsonValue>(capability: AgentCapability<TConfig>, config: TConfig) {
    // Add to list of known
    this.capabilities.push(capability);

    // Setup the capability to it has a reference to the agent
    capability.attach(this);

    // Fresh registrations initialize default state from config before tools are built.
    capability.initialize(config);

    // On fresh launch, we run this hook and handle new tools
    const registration = capability.hookOnRegister(config);
    this.registerCapabilitySystemPrompt(capability, registration.system);
    for (const tool of registration.tools) {
      this.registerTool(capability, tool);
    }

    this.emit('trace', {
      type: 'capability-register',
      data: {
        capabilityId: capability.id,
        description: capability.description,
        name: capability.id,
        tools: this.toolsForCapabilityTrace(registration.tools),
      },
    });
  }

  private registerTool(capability: AgentCapability, tool: AgentTool) {
    tool.initialize(this);
    this.agentTools.push({ capabilityId: capability.id, tool });
    this.thread.pushUser(`Tool Registration: ${tool.id}`, ...tool.describe());
  }

  private registerCapabilitySystemPrompt(capability: AgentCapability, system: string): void {
    const prompt = system.trim();
    if (prompt.length === 0) {
      return;
    }
    this.thread.pushUser(
      `Capability System Prompt: ${capability.id}`,
      Cell.header2(`Capability: ${capability.id}`),
      Cell.text(prompt),
    );
  }

  /**
   * Removes a capability from the agent, deregisters its tools, and calls
   * the capability's on-remove hook so it can free resources it opened
   * during hookOnRegister.
   */
  public async removeCapability(capability: AgentCapability, reason: string) {
    const tools = this.agentTools.filter((registration) => registration.capabilityId === capability.id);
    this.capabilities.splice(this.capabilities.indexOf(capability), 1);
    for (const registration of tools) {
      await this.removeTool(registration.tool, reason);
    }
    capability.hookOnRemove(reason);

    this.emit('trace', {
      type: 'capability-deregister',
      data: {
        capabilityId: capability.id,
        reason: [Cell.text(reason)],
        toolDeregistrations: tools.map((registration) => ({
          name: registration.tool.id,
          type: registration.tool.type,
        })),
      },
    });
  }

  /**
   * Removes an AgentTool from the active tool list. A deregistration cell
   * is appended to the thread so the model sees the tool is no longer
   * available on its next turn.
   */
  public async removeTool(tool: AgentTool, reason: string) {
    const toolIndex = this.agentTools.findIndex((registration) => registration.tool === tool);
    if (toolIndex >= 0) {
      this.agentTools.splice(toolIndex, 1);
    }
    this.thread.pushUser(`Tool Deregistration: ${tool.id}`, ...Event.toolDeregistration({ name: tool.id, reason }));
  }

  /**
   * Notifies every registered capability of a lifecycle status edge after
   * the base class records the change and emits the `'status'` event.
   * Capabilities use this to mirror agent state onto external resources
   * (e.g. flipping an owned task to `waiting` when the agent pauses).
   * Errors thrown by a capability hook are swallowed so a misbehaving
   * capability cannot crash the status path that emitted them.
   */
  protected override changeStatus(status: AgentStatus, message: string): void {
    const previous = this.getStatus();
    super.changeStatus(status, message);
    if (previous === status) {
      return;
    }
    for (const capability of this.capabilities) {
      try {
        capability.hookOnAgentStatusChange(previous, status);
      } catch {
        // Capability hook failures must not break the status pipeline.
      }
    }
  }

  /**
   * Internal hook to run whenever a new message is added to the agent's incoming message queue, if we are not already running
   */
  private onIncomingMessage() {
    const status = this.getStatus();

    // if we are already running, do nothing, we will get read the message again in the next loop
    if (status === 'running') {
      return;
    }

    // if we are idle, we can start the agent so it pulls in the message
    if (status === 'idle' || status === 'waiting') {
      this.run().catch((error) => {
        this.changeStatus('failed', `agent failed: ${error instanceof Error ? error.message : String(error)}`);
      });
    }
  }

  /**
   * Runs the agentic loop itself by kicking off agent turns until we reach a settled state
   */
  private async run() {
    try {
      this.changeStatus('running', 'agent running');
      const waitingForSignal = await this.runLoop();
      if (waitingForSignal) {
        return;
      }
      this.emit('trace', {
        type: 'agent-success',
        data: { content: [] },
      });
      this.changeStatus('idle', 'agent stopped');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.emit('trace', {
        type: 'agent-failure',
        data: {
          content: [Cell.text(message)],
          error: message,
        },
      });
      this.changeStatus('failed', `agent failed: ${message}`);
    }
  }

  /**
   * Handles the logic that is the agentic loop itself, the lifecycle of an agent
   */
  private async runLoop(): Promise<boolean> {
    while (true) {
      // If a stop was requested, exit the loop without starting another turn.
      // The in-flight turn (if any) already completed because the check sits
      // at the loop boundary; this only prevents a fresh model call.
      if (this.stopRequested) {
        const reason = this.stopReason;
        this.stopRequested = false;
        this.stopReason = '';
        this.emit('trace', {
          type: 'agent-failure',
          data: { content: [Cell.text(`Stopped: ${reason}`)], error: `stopped: ${reason}` },
        });
        return false;
      }

      // First we process any durable signals that might have woken the agent
      const waitingForSignal = await this.pullSignals();
      if (waitingForSignal) {
        return true;
      }

      // Then we trigger the initial step
      await this.hookOnAgenticStepStart();

      // Then we pull in any messages that are waiting to be read
      const messages = this.pullAllMessages();
      if (messages.length > 0) {
        this.thread.pushUser('User Message', ...Event.incomingMessage({ content: messages }));
        this.emit('trace', {
          type: 'user-message',
          data: { content: messages },
        });
      }

      // Then we run the agentic step itself
      const result = await this.runAgenticStep();

      const toolExecutedInLastLoop = result.anyToolsWereExecuted;
      const messagesWaitingToBeRead = this.peakMessages();

      // Exit criteria for agentic loop, if there are no tools and no messages left and we ran out of tools
      const nothingLeftToDo = !messagesWaitingToBeRead && !toolExecutedInLastLoop;

      // if there is nothing left to do, we can attempt to exit the loop, note that we might not be able to exit if capabilties block us
      if (nothingLeftToDo) {
        const exitHook = await this.hookOnAttemptedExit();
        if (exitHook.blockingExit) {
          continue;
        }

        // Else we are free to exit the loop
        break;
      }
    }
    return false;
  }

  /**
   * Soft-stops the agent. Records a stop request so the agentic loop exits
   * at the next iteration boundary instead of queuing another model call.
   * The currently in-flight turn (model call + any pending tools) completes
   * because there is no way to interrupt it mid-flight, but no new turn is
   * started. The registry service flips the durable status to idle after
   * this returns.
   */
  public async stop(reason: string): Promise<void> {
    this.stopRequested = true;
    this.stopReason = reason;
  }

  /**
   * Resumes the agent after signal state changes.
   * The incoming-message path already knows how to drain signals and
   * queued user messages, so signal wakeups reuse that flow.
   */
  public resumeFromSignal(): void {
    this.onIncomingMessage();
  }

  private async pullSignals(): Promise<boolean> {
    const signals = await this.bridge.signals.snapshot({ agentId: this.agentId });
    if (signals.openAwaited.length > 0) {
      this.emit('trace', {
        type: 'agent-waiting',
        data: { signals: signals.openAwaited.map((signal) => this.signalTraceData(signal)) },
      });
      this.changeStatus('waiting', 'agent waiting for signals');
      return true;
    }

    for (const signal of signals.received) {
      this.emit('trace', { type: 'signal-received', data: this.signalTraceData(signal) });
      this.capabilities.find((capability) => capability.id === signal.capabilityId)?.hookOnSignal(signal);
      await this.bridge.signals.markResolved({ id: signal.id });
      this.emit('trace', {
        type: 'signal-resolved',
        data: { ...this.signalTraceData(signal), status: 'resolved' },
      });
    }
    return false;
  }

  /**
   * Handles the logic that is a single step in the agentic loop
   * This includes a model call and resulting tool invocation only
   */
  private async runAgenticStep() {
    // Model call to our agent
    const result = await this.invokeModel();

    // Handle all the tools
    for (const toolCall of result.toolCalls) {
      await this.invokeTool(toolCall);
    }

    return { anyToolsWereExecuted: result.toolCalls.length > 0 };
  }

  /**
   * Invokes the llm model itself and writes to context all the output so its in the correct trace order
   */
  private async invokeModel(): Promise<InvokeModelResult> {
    const modelCallId = crypto.randomUUID();
    this.emit('trace', {
      type: 'model-call-start',
      data: {
        modelCallId,
        modelId: this.provider.modelId,
        provider: this.provider.providerId,
        threadCursor: this.thread.cursor,
      },
    });

    // This will not throw an error, there is a retry mechanism in the provider and
    // it returns an "error" result if it fails rather than throwing
    const result = await this.provider.invoke(this.thread, modelCallId);
    this.emitModelCallResult(modelCallId, result);

    if (result.status === 'error') {
      const errorMessage = result.error ?? 'Provider returned an error.';
      throw new Error(errorMessage);
    }

    for (const output of result.output) {
      this.recordProviderOutput(output);
    }

    return {
      threadCellPointer: result.threadCellPointer,
      toolCalls: this.toolCallsFromProviderOutput(result.output),
    };
  }

  private emitModelCallResult(modelCallId: string, result: ProviderResult): void {
    if (result.status === 'error') {
      this.emit('trace', {
        type: 'model-call-failure',
        data: {
          error: result.error ?? 'Provider returned an error.',
          modelCallId,
        },
      });
    } else {
      this.emit('trace', {
        type: 'model-call-success',
        data: { modelCallId },
      });
    }
    this.emit('modelCall', result);
    for (const lineItem of result.prices) {
      this.emit('lineItem', lineItem);
    }
  }

  private recordProviderOutput(output: ProviderOutputBlock): void {
    if (output.type === 'thinking') {
      this.recordThinkingOutput(output.text);
    }
    if (output.type === 'text') {
      this.recordTextOutput(output.text);
    }
    if (output.type === 'image') {
      this.recordImageOutput(output.base64Image);
    }
    if (output.type === 'tool') {
      this.recordToolOutput(output);
    }
  }

  private recordThinkingOutput(text: string): void {
    this.thread.pushAssistant('Assistant Thinking', ...Event.agentMessage({ raw: text }));
    this.emit('trace', {
      type: 'assistant-thinking',
      data: { content: [Cell.text(text)] },
    });
  }

  private recordTextOutput(text: string): void {
    this.thread.pushAssistant('Assistant Message', ...Event.agentMessage({ raw: text }));
    this.emit('trace', {
      type: 'assistant-message',
      data: { content: [Cell.text(text)] },
    });
  }

  private recordImageOutput(base64Image: string): void {
    this.thread.pushAssistant('Assistant Message', Cell.image(base64Image));
    this.emit('trace', {
      type: 'assistant-message',
      data: { content: [Cell.image(base64Image)] },
    });
  }

  private recordToolOutput(output: ProviderOutputBlock): void {
    if (output.type !== 'tool') {
      return;
    }
    this.thread.pushAssistant(
      'Tool Call Requested',
      Cell.toolUse({
        callId: output.callid,
        toolId: output.toolid,
        input: output.payload,
      }),
    );
    this.emit('trace', {
      type: 'tool-call-requested',
      data: {
        callId: output.callid,
        input: output.payload,
        source: 'native',
        toolId: output.toolid,
      },
    });
  }

  private toolCallsFromProviderOutput(output: ProviderOutputBlock[]): PebbleToolCall[] {
    return output
      .filter((item) => item.type === 'tool')
      .map((item) => ({
        id: item.callid,
        type: 'native',
        toolId: item.toolid,
        input: item.payload as ToolInput,
      }));
  }

  /**
   * Invokes a registered tool by id from model output
   */
  public async invokeTool(input: PebbleToolCall) {
    const startTime = Date.now();
    this.emit('trace', {
      type: 'tool-call-start',
      data: {
        callId: input.id,
        input: this.toolInputForTrace(input.input),
        source: input.type,
        toolId: input.toolId,
      },
    });

    // Get the tool handler in question
    const tool = this.agentTools.find((t) => t.tool.id === input.toolId)?.tool;

    // Fail, tool invocation failure
    if (tool === undefined) {
      this.recordToolFailure(input, startTime, `Tool not found: ${input.toolId}`);
      return;
    }

    try {
      // Call tool handler itself
      const result = await tool.invoke(input.input);

      if (tool.type !== 'cli') {
        this.recordToolResult(input, startTime, result);
      }
      this.emitToolResultTrace(input, result);

      // If this is a cli tool, we actually have no context to write to the thread, so we just return the result
      if (tool.type === 'cli') {
        return result;
      }
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : String(caught);
      this.recordToolFailure(input, startTime, message);
      return;
    }
  }

  private recordToolResult(input: PebbleToolCall, startTime: number, result: ToolResponseResult): void {
    this.pushToolResultThreadEvent({
      content: result.content,
      duration: Date.now() - startTime,
      error: result.status === 'error' ? result.error : null,
      input,
      success: result.status === 'success',
    });
  }

  private emitToolResultTrace(input: PebbleToolCall, result: ToolResponseResult): void {
    if (result.status === 'error') {
      this.emit('trace', {
        type: 'tool-call-failure',
        data: {
          error: result.error,
          result: result.content,
          toolCallId: input.id,
        },
      });
      return;
    }
    this.emit('trace', {
      type: 'tool-call-success',
      data: {
        result: result.content,
        toolCallId: input.id,
      },
    });
  }

  private recordToolFailure(input: PebbleToolCall, startTime: number, message: string): void {
    const content = [Cell.text(message)];
    if (input.type !== 'cli') {
      this.pushToolResultThreadEvent({
        content,
        duration: Date.now() - startTime,
        error: message,
        input,
        success: false,
      });
    }
    this.emit('trace', {
      type: 'tool-call-failure',
      data: {
        error: message,
        result: content,
        toolCallId: input.id,
      },
    });
  }

  /**
   * Hooks are ways we can tie into the agentic loop at specific points and take actions
   * They allow guidance of the agent
   */

  // Called before each agentic step
  private async hookOnAgenticStepStart() {
    for (const capability of this.capabilities) {
      await capability.hookBeforeAgentTurn();
    }
  }

  // Called when the agent is attempting to exit, so we can force it to continue
  private async hookOnAttemptedExit() {
    let blockingExit = false;

    for (const capability of this.capabilities) {
      const exitHook = capability.hookOnAgentExit();
      if (!exitHook.permitExit) {
        this.thread.pushUser(
          'Capability Exit Blocked',
          Cell.header2(`Capability exit blocked: ${capability.id}`),
          Cell.text(exitHook.reason),
        );
        this.emit('trace', {
          type: 'capability-exit-blocked',
          data: {
            capabilityId: capability.id,
            reason: [Cell.text(exitHook.reason)],
          },
        });
        blockingExit = true;
      }
    }

    return { blockingExit };
  }

  /**
   * Shutdown the agent
   */
  public async shutdown() {
    // Change status to offline
    this.changeStatus('offline', 'agent shutting down');
  }

  /**
   * Adds extra user-context cells to the current conversation thread.
   * Capabilities call this before a turn to inject task lists, workspace
   * state, or other runtime guidance.
   */
  public addUserContext(label: string, input: ThreadCellInput): void {
    const cells = Array.isArray(input) ? input : [input];
    this.thread.pushUser(label, ...cells);
  }

  /**
   * Returns metadata required to resume this Pebble thread.
   * The daemon persists the thread id so rehydration can reload the same
   * conversation cells.
   */
  public getResumeMetadata() {
    return { threadId: this.thread.threadId };
  }

  /**
   * Conversation thread utilities
   */
  private pushToolResultThreadEvent(input: ToolResultThreadEventInput) {
    this.thread.pushUser(
      `Tool Execution ${input.success ? 'Success' : 'Failure'}: ${input.input.toolId}`,
      ...Event.toolInvokeResult({
        id: input.input.id,
        name: input.input.toolId,
        content: input.content,
        duration: input.duration,
        error: input.error,
        success: input.success,
      }),
    );
  }

  // Utils

  private toolsForCapabilityTrace(tools: AgentTool[]) {
    return tools.map((tool) => ({
      description: tool.description,
      example: tool.describe(),
      name: tool.id,
      type: tool.type,
    }));
  }

  private toolInputForTrace(input: ToolInput): ToolInputRecord {
    if (input !== null && typeof input === 'object' && !Array.isArray(input)) {
      return input;
    }
    return { value: input };
  }

  private signalTraceData(signal: AgentSignal) {
    return {
      capabilityId: signal.capabilityId,
      data: signal.data,
      description: signal.description,
      kind: signal.kind,
      name: signal.name,
      signalId: signal.signalId,
      status: signal.status,
    };
  }
}
