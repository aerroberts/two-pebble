import type { AgentCapability } from '../../capabilities/agent-capability';
import type { ModelProvider } from '../../providers/index';
import { Cell, ConversationThread, type DataCells, Event } from '../../thread/index';
import type { PebbleJsonValue } from '../../types';
import { Agent } from '../agent';
import type { AgentTool } from '../tools/agent-tool';
import type { ToolInput } from '../tools/tool-input';
import type {
  AgentSignal,
  AgentToolRegistration,
  InvokeModelResult,
  PebbleAgentConfig,
  PebbleToolCall,
  ThreadCellInput,
} from '../types';

/**
 * Pebble agents are those built into our system to allow higher level actions and orchestration.
 * They allow capabilities to be registered and tools to be registered and used by the agent.
 */
export class PebbleAgent extends Agent {
  // Each pebble agent owns a conversation thread which is the context sent to the model
  private readonly thread: ConversationThread;

  // Each agent also has a provider which exposes model access
  private readonly provider: ModelProvider;

  // Capabilties are the ties to the world that the agent needs to do anything of value
  private readonly capabilities: AgentCapability[] = [];
  private readonly agentTools: AgentToolRegistration[] = [];

  public constructor(config: PebbleAgentConfig) {
    super({
      agentId: config.agentId,
      description: config.description,
      name: config.name,
      workspacePath: config.workspacePath,
    });
    this.provider = config.provider;
    this.thread =
      config.restoredThread === undefined
        ? new ConversationThread()
        : new ConversationThread({ cells: config.restoredThread.cells, threadId: config.restoredThread.threadId });
    this.thread.onCell((cell) => {
      this.emit('threadMessage', {
        threadId: this.thread.threadId,
        ...cell,
      });
    });

    if (config.restoredThread === undefined && config.systemPrompt !== undefined && config.systemPrompt.length > 0) {
      this.thread.pushSystem('System Prompt', Cell.text(config.systemPrompt));
    }

    // Setup internal hooks to handle signals from abstract parent
    this.on('signal', (signal: AgentSignal) => {
      if (signal === 'incoming-message') {
        this.signaledIncomingMessage();
      }
    });

    // Status
    this.changeStatus('idle', 'agent initialized');
  }

  // When this capability is being rehydrated from a state stored on disk which was persisted from a previous run
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

  // When we are registering a new capability for the first time
  public registerCapability<TConfig extends PebbleJsonValue>(capability: AgentCapability<TConfig>, config: TConfig) {
    // Add to list of known
    this.capabilities.push(capability);

    // Setup the capability to it has a reference to the agent
    capability.attach(this);

    // Fresh registrations initialize default state from config before tools are built.
    capability.initialize(config);

    // On fresh launch, we run this hook and handle new tools
    const registration = capability.hookOnRegister(config);
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
    if (toolIndex >= 0) this.agentTools.splice(toolIndex, 1);
    this.thread.pushUser(`Tool Deregistration: ${tool.id}`, ...Event.toolDeregistration({ name: tool.id, reason }));
  }

  /**
   * Internal hook to run whenever a new message is added to the agent's incoming message queue, if we are not already running
   */
  private signaledIncomingMessage() {
    const status = this.getStatus();

    // if we are already running, do nothing, we will get read the message again in the next loop
    if (status === 'running') return;

    // if we are idle, we can start the agent so it pulls in the message
    if (status === 'idle') {
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
      await this.runLoop();
      this.changeStatus('idle', 'agent stopped');
    } catch (error) {
      this.changeStatus('failed', `agent failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Handles the logic that is the agentic loop itself, the lifecycle of an agent
   */
  private async runLoop(): Promise<void> {
    while (true) {
      // First we trigger the initial step
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

    // Tracking for the call
    this.emit('modelCall', result);
    for (const lineItem of result.prices) {
      this.emit('lineItem', lineItem);
    }

    if (result.status === 'error') {
      const errorMessage = result.error ?? 'Provider returned an error.';
      throw new Error(errorMessage);
    }

    // Handle all the output being written to the thead and to the trace
    // TODO
    for (const output of result.output) {
      if (output.type === 'thinking') {
        this.thread.pushAssistant('Assistant Thinking', ...Event.agentMessage({ raw: output.text }));
        this.emit('trace', {
          type: 'assistant-thinking',
          data: { content: [Cell.text(output.text)] },
        });
      }
      if (output.type === 'text') {
        this.thread.pushAssistant('Assistant Message', ...Event.agentMessage({ raw: output.text }));
        this.emit('trace', {
          type: 'assistant-message',
          data: { content: [Cell.text(output.text)] },
        });
      }
      if (output.type === 'image') {
        this.thread.pushAssistant('Assistant Message', Cell.image(output.base64Image));
        this.emit('trace', {
          type: 'assistant-message',
          data: { content: [Cell.image(output.base64Image)] },
        });
      }
      if (output.type === 'tool') {
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
    }

    return {
      threadCellPointer: result.threadCellPointer,
      toolCalls: result.output
        .filter((output) => output.type === 'tool')
        .map((output) => ({
          id: output.callid,
          type: 'native',
          toolId: output.toolid,
          input: output.payload as ToolInput,
        })),
    };
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
      const message = `Tool not found: ${input.toolId}`;
      if (input.type !== 'cli') {
        this.pushToolResultThreadEvent({
          content: [Cell.text(message)],
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
          result: [Cell.text(message)],
          toolCallId: input.id,
        },
      });
      return;
    }

    try {
      // Call tool handler itself
      const result = await tool.invoke(input.input);

      if (tool.type !== 'cli') {
        this.pushToolResultThreadEvent({
          content: result.content,
          duration: Date.now() - startTime,
          error: result.status === 'error' ? result.error : null,
          input,
          success: result.status === 'success',
        });
      }

      if (result.status === 'error') {
        this.emit('trace', {
          type: 'tool-call-failure',
          data: {
            error: result.error,
            result: result.content,
            toolCallId: input.id,
          },
        });
      } else {
        this.emit('trace', {
          type: 'tool-call-success',
          data: {
            result: result.content,
            toolCallId: input.id,
          },
        });
      }

      // If this is a cli tool, we actually have no context to write to the thread, so we just return the result
      if (tool.type === 'cli') {
        return result;
      }
    } catch (caught) {
      // Fail, tool call itself failed
      const message = caught instanceof Error ? caught.message : String(caught);
      if (input.type !== 'cli') {
        this.pushToolResultThreadEvent({
          content: [Cell.text(message)],
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
          result: [Cell.text(message)],
          toolCallId: input.id,
        },
      });
      return;
    }
  }

  /**
   * Hooks are ways we can tie into the agentic loop at specific points and take actions
   * They allow guidance of the agent
   */

  // Called before each agentic step
  private async hookOnAgenticStepStart() {
    for (const capability of this.capabilities) {
      capability.hookBeforeAgentTurn();
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

  public addUserContext(label: string, input: ThreadCellInput): void {
    const cells = Array.isArray(input) ? input : [input];
    this.thread.pushUser(label, ...cells);
  }

  public getResumeMetadata() {
    return { threadId: this.thread.threadId };
  }

  /**
   * Conversation thread utilities
   */
  private pushToolResultThreadEvent(input: {
    content: DataCells;
    duration: number;
    error: string | null;
    input: PebbleToolCall;
    success: boolean;
  }) {
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

  private toolInputForTrace(input: ToolInput): object {
    if (input !== null && typeof input === 'object') return input;
    return { value: input };
  }
}
