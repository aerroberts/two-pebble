import type {
  HookInput,
  SDKMessage,
  SDKUserMessage,
  SubagentStartHookInput,
  SubagentStopHookInput,
} from '@anthropic-ai/claude-agent-sdk';
import { query } from '@anthropic-ai/claude-agent-sdk';
import type { DataCells } from '../../../thread/types';
import { ThirdPartyAgentFramework } from '../../third-party-agent-framework';
import type { AgentFrameworkSubmitMessageInput } from '../../types';
import { ClaudeCodeEventConverter } from './claude-code-event-converter';
import {
  type ActiveClaudeCodeQuery,
  type ClaudeCodeAgentOptions,
  type InputStreamResolver,
  mapApiProvider,
  type QueryHooks,
  type QueryOptions,
  readTranscriptWithRetry,
} from './claude-code-runtime';
import type { ConvertedClaudeCodeEvent } from './claude-code-trace-mapping';
import { cellToString } from './utils/cell-to-string';
import { readResumeSessionId } from './utils/resume-metadata';

/**
 * Adapts Claude Code SDK streams to Pebble framework events.
 * Owns transport (input stream, query lifecycle), session resume state,
 * and IO (transcript reads). Trace conversion is delegated to the
 * `ClaudeCodeEventConverter`; this class just dispatches converted events.
 */
export class ClaudeCodeAgent extends ThirdPartyAgentFramework {
  public readonly frameworkId = 'claude-code';

  private readonly converter = new ClaudeCodeEventConverter();
  private readonly defaultCwd: string | undefined;
  private readonly pathToClaudeCodeExecutable: string;
  private pendingInputs: SDKUserMessage[] = [];
  private inputResolver: InputStreamResolver | undefined = undefined;
  private inputClosed = false;
  private providerPromise: Promise<string> | undefined = undefined;
  private warm = false;
  private sessionId: string | undefined;
  private lastSdkMessageAt = Date.now();
  private iteratorSettled = true;
  private activeQuery: ActiveClaudeCodeQuery | undefined = undefined;

  public constructor(options: ClaudeCodeAgentOptions) {
    super();
    this.defaultCwd = options.cwd;
    this.pathToClaudeCodeExecutable = options.pathToClaudeCodeExecutable;
    this.sessionId = readResumeSessionId(options.resumeMetadata);
  }

  /**
   * Submits one user message into the Claude Code session. Always announces
   * the working state — for fresh sessions that flip is "we're starting,"
   * and for warm sessions sitting idle between turns it's "a new turn is
   * beginning." Only spawns a new `runSession` when there isn't one
   * iterating; otherwise the existing session picks up the queued message.
   *
   * Ordering matters: enqueue the input BEFORE we let the working-status
   * fanout run, otherwise observers that synchronously react to the
   * 'working' edge (e.g. the wrapping FrameworkAgent emitting a
   * system-message trace and flipping the durable status) can sample the
   * adapter while the queue is still empty. That race is what makes the
   * very first user message look like it failed to launch the agent —
   * the daemon sees `running` but the SDK iterator has nothing yet — so
   * the user resends and the second message appears to "kick" it.
   */
  public async submitMessage(input: AgentFrameworkSubmitMessageInput) {
    const wasIdle = !this.warm;
    this.warm = true;
    this.enqueueInput(this.toUserMessage(this.cellsToString(input.input)));
    this.emitStatusChange({ status: 'working' });
    if (wasIdle) {
      void this.runSession(input);
    }
  }

  private async runSession(input: AgentFrameworkSubmitMessageInput) {
    let error: string | undefined;
    this.iteratorSettled = false;
    this.inputClosed = false;
    this.lastSdkMessageAt = Date.now();
    try {
      const claude = query(this.buildQueryOptions(input.workspacePath, input.systemPrompt));
      this.activeQuery = claude;
      this.providerPromise = claude
        .accountInfo()
        .then((info) => mapApiProvider(info.apiProvider))
        .catch(() => 'anthropic');
      for await (const message of claude) {
        this.lastSdkMessageAt = Date.now();
        await this.handleSdkMessage(message);
      }
    } catch (caught) {
      error = caught instanceof Error ? caught.message : String(caught);
    } finally {
      this.activeQuery = undefined;
      this.iteratorSettled = true;
      this.warm = false;
      this.emitStatusChange(error === undefined ? { status: 'idle' } : { status: 'idle', error });
    }
  }

  /**
   * Interrupts the Claude Code SDK iterator so the underlying subprocess
   * stops doing work immediately. The runSession finally block then fires
   * a normal 'idle' status change and the wrapping FrameworkAgent reflects
   * that back to the durable agent record.
   */
  public override async stop(_reason: string): Promise<void> {
    const query = this.activeQuery;
    this.pendingInputs.splice(0, this.pendingInputs.length);
    if (query !== undefined) {
      try {
        await query.interrupt();
      } catch {
        // The SDK can throw if the query already settled or interrupt is
        // not supported; we still want the wrapping agent to settle.
      }
    }
    this.inputClosed = true;
    const resolver = this.inputResolver;
    this.inputResolver = undefined;
    resolver?.();
  }

  /**
   * Reports activity from the SDK iterator's own perspective. The Claude
   * Code SDK has no in-band ping, so liveness is derived from whether the
   * for-await loop is still consuming messages and how recently a message
   * arrived. When the iterator has settled and there is no queued input,
   * the agent is genuinely idle even if no status change event fired.
   */
  public override async probe() {
    const alive = !this.iteratorSettled;
    const hint = alive ? 'sdk-iterating' : this.pendingInputs.length > 0 ? 'queued' : 'idle';
    if (alive) {
      return { alive, lastActivityAt: this.lastSdkMessageAt, hint };
    }
    if (this.pendingInputs.length === 0) {
      return { alive, settled: 'idle' as const, lastActivityAt: this.lastSdkMessageAt, hint };
    }
    return { alive, lastActivityAt: this.lastSdkMessageAt, hint };
  }

  private async handleSdkMessage(message: SDKMessage) {
    this.captureSessionId(message);
    const provider = (await this.providerPromise) ?? 'anthropic';
    for (const event of this.converter.convertMessage(message, provider)) {
      this.dispatch(event);
    }
    if (message.type === 'result') {
      // End-of-turn marker from the SDK. The session itself stays warm —
      // the prompt stream is still open and the SDK iterator keeps pulling
      // — so the wrapping FrameworkAgent flips to `idle` without tearing
      // down the Claude Code session. The next `submitMessage` enqueues
      // another input through the same iterator, which re-emits `working`
      // and runs the next turn against the same context.
      this.emitStatusChange({ status: 'idle' });
    }
  }

  private buildQueryOptions(workspacePath: string, systemPrompt: string) {
    const cwd = workspacePath.length > 0 ? workspacePath : this.defaultCwd;
    const options: QueryOptions = {};
    if (cwd !== undefined) {
      options.cwd = cwd;
    }
    options.allowDangerouslySkipPermissions = true;
    options.forwardSubagentText = true;
    options.hooks = this.buildQueryHooks();
    options.pathToClaudeCodeExecutable = this.pathToClaudeCodeExecutable;
    options.permissionMode = 'bypassPermissions';
    if (this.sessionId !== undefined) {
      options.resume = this.sessionId;
    }
    if (systemPrompt.length > 0) {
      options.systemPrompt = { type: 'preset', preset: 'claude_code', append: systemPrompt };
    }
    return { prompt: this.inputStream(), options };
  }

  private buildQueryHooks(): QueryHooks {
    const hooks = [(input: HookInput) => this.handleQueryHook(input)];
    return { SubagentStart: [{ hooks }], SubagentStop: [{ hooks }] };
  }

  private async handleQueryHook(input: HookInput) {
    if (input.hook_event_name === 'SubagentStart') {
      this.handleSubagentStart(input);
    }
    if (input.hook_event_name === 'SubagentStop') {
      await this.handleSubagentStop(input);
    }
    return { continue: true };
  }

  private handleSubagentStart(input: SubagentStartHookInput) {
    for (const event of this.converter.convertSubagentStart(input)) {
      this.dispatch(event);
    }
  }

  private async handleSubagentStop(input: SubagentStopHookInput) {
    const transcript = await readTranscriptWithRetry(input.agent_transcript_path);
    const provider = (await this.providerPromise) ?? 'anthropic';
    for (const event of this.converter.convertSubagentStop(input, transcript, provider)) {
      this.dispatch(event);
    }
  }

  private dispatch(event: ConvertedClaudeCodeEvent) {
    if (event.kind === 'agent-trace') {
      this.emitTrace(event.trace.type, event.trace.data);
    } else if (event.kind === 'sub-agent-trace') {
      this.emitSubAgentTrace(event.event);
    } else if (event.kind === 'sub-agent-start') {
      this.emitSubAgentStart(event.event);
    } else if (event.kind === 'sub-agent-stop') {
      this.emitSubAgentStop(event.event);
    } else if (event.kind === 'sub-agent-usage') {
      this.emitSubAgentUsage(event.event);
    } else if (event.kind === 'usage') {
      this.emitUsage(event.usage);
    }
  }

  private captureSessionId(message: SDKMessage) {
    const incoming = message.session_id;
    if (incoming === undefined || incoming.length === 0) {
      return;
    }
    if (incoming === this.sessionId) {
      return;
    }
    this.sessionId = incoming;
    this.emitMetadataUpdate({ sessionId: incoming });
  }

  private cellsToString(cells: DataCells): string {
    return cells.map((cell) => cellToString(cell)).join('\n');
  }

  private toUserMessage(content: string): SDKUserMessage {
    return { type: 'user', message: { role: 'user', content }, parent_tool_use_id: null };
  }

  private enqueueInput(message: SDKUserMessage) {
    this.pendingInputs.push(message);
    const resolver = this.inputResolver;
    this.inputResolver = undefined;
    resolver?.();
  }

  private async *inputStream() {
    while (!this.inputClosed) {
      const next = this.pendingInputs.shift();
      if (next === undefined) {
        await new Promise<void>((resolve) => {
          this.inputResolver = resolve;
        });
        continue;
      }
      yield next;
    }
  }
}
