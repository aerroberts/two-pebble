import type { Thread, ThreadEvent } from '@openai/codex-sdk';
import { Codex } from '@openai/codex-sdk';
import type { DataCells } from '../../../thread/types';
import { ThirdPartyAgentFramework } from '../../third-party-agent-framework';
import type { AgentFrameworkSubmitMessageInput } from '../../types';
import { CodexEventConverter } from './codex-event-converter';
import type {
  CodexAgentOptions,
  CodexThreadOptions,
  InputStreamResolver,
  ThreadEventDispatchResult,
} from './codex-runtime';
import type { ConvertedCodexEvent } from './codex-trace-mapping';
import { cellToString } from './utils/cell-to-string';
import { readResumeThreadId } from './utils/resume-metadata';

/**
 * Adapts the OpenAI Codex SDK streams to Pebble framework events. Owns
 * transport (Codex client, Thread lifecycle), session resume state, and
 * the cancellation handle. Trace conversion is delegated to the
 * `CodexEventConverter`; this class just dispatches converted events.
 */
export class CodexAgent extends ThirdPartyAgentFramework {
  public readonly frameworkId = 'codex';

  private readonly converter = new CodexEventConverter();
  private readonly defaultCwd: string | undefined;
  private readonly codex: Codex;
  private threadId: string | undefined;
  private thread: Thread | undefined;
  private pendingInputs: string[] = [];
  private inputResolver: InputStreamResolver | undefined = undefined;
  private inputClosed = false;
  private warm = false;
  private iteratorSettled = true;
  private lastSdkEventAt = Date.now();
  private activeAbortController: AbortController | undefined = undefined;
  private readonly modelId: string | undefined;

  public constructor(options: CodexAgentOptions) {
    super();
    this.defaultCwd = options.cwd;
    this.threadId = readResumeThreadId(options.resumeMetadata);
    this.codex = new Codex({ codexPathOverride: options.pathToCodexExecutable });
    this.modelId = undefined;
  }

  /**
   * Submits one user message into the Codex thread. Always announces the
   * working state — for fresh threads that flip is "we're starting," and
   * for warm threads sitting idle between turns it's "a new turn is
   * beginning." Only spawns a new `runSession` when there isn't one
   * iterating; otherwise the existing session picks up the queued message.
   */
  public async submitMessage(input: AgentFrameworkSubmitMessageInput) {
    const wasIdle = !this.warm;
    this.warm = true;
    // Enqueue first, then announce 'working'. If we emit the status edge
    // first, observers that synchronously react (FrameworkAgent emits a
    // system-message trace and flips the durable status to running) can
    // observe `running` with an empty pendingInputs queue, which makes
    // the first user message look like it never launched the agent —
    // the user retries and the "second" message appears to kick it.
    this.enqueueInput(this.cellsToPrompt(input.input, input.systemPrompt, !wasIdle));
    this.emitStatusChange({ status: 'working' });
    if (wasIdle) {
      void this.runSession(input);
    }
  }

  private async runSession(input: AgentFrameworkSubmitMessageInput) {
    let error: string | undefined;
    this.iteratorSettled = false;
    this.inputClosed = false;
    this.lastSdkEventAt = Date.now();
    try {
      this.thread = this.openThread(input.workspacePath);
      for await (const prompt of this.inputStream()) {
        const turnError = await this.runTurn(prompt);
        if (turnError !== undefined) {
          error = turnError;
          break;
        }
      }
    } catch (caught) {
      error = caught instanceof Error ? caught.message : String(caught);
    } finally {
      this.activeAbortController = undefined;
      this.iteratorSettled = true;
      this.warm = false;
      this.emitStatusChange(error === undefined ? { status: 'idle' } : { status: 'idle', error });
    }
  }

  private async runTurn(prompt: string): Promise<string | undefined> {
    const thread = this.thread;
    if (thread === undefined) {
      return 'codex thread is not initialized';
    }
    const controller = new AbortController();
    this.activeAbortController = controller;
    let turnError: string | undefined;
    try {
      const streamed = await thread.runStreamed(prompt, { signal: controller.signal });
      for await (const event of streamed.events) {
        this.lastSdkEventAt = Date.now();
        const dispatched = this.handleThreadEvent(event);
        if (dispatched.turnFailure !== undefined) {
          turnError = dispatched.turnFailure;
        }
      }
    } catch (caught) {
      turnError = caught instanceof Error ? caught.message : String(caught);
    } finally {
      this.activeAbortController = undefined;
    }
    // Always emit an idle status at the end of a turn so the wrapping agent
    // returns to idle between turns, mirroring the Claude Code adapter's
    // SDK `result` semantics. The thread itself stays warm — the next
    // `submitMessage` enqueues another prompt against the same Thread.
    this.emitStatusChange(turnError === undefined ? { status: 'idle' } : { status: 'idle', error: turnError });
    return turnError;
  }

  /**
   * Interrupts the Codex turn so the underlying CLI stops doing work
   * immediately. The runSession finally block then fires a normal 'idle'
   * status change and the wrapping FrameworkAgent reflects that back to
   * the durable agent record.
   */
  public override async stop(_reason: string): Promise<void> {
    void _reason;
    this.pendingInputs.splice(0, this.pendingInputs.length);
    this.activeAbortController?.abort();
    this.inputClosed = true;
    const resolver = this.inputResolver;
    this.inputResolver = undefined;
    resolver?.();
  }

  /**
   * Reports activity from the SDK iterator's own perspective. The Codex
   * SDK has no in-band ping, so liveness is derived from whether the
   * for-await loop is still consuming events and how recently one
   * arrived. When the iterator has settled and there is no queued input,
   * the agent is genuinely idle even if no status change event fired.
   */
  public override async probe() {
    const alive = !this.iteratorSettled;
    const hint = alive ? 'sdk-iterating' : this.pendingInputs.length > 0 ? 'queued' : 'idle';
    if (alive) {
      return { alive, lastActivityAt: this.lastSdkEventAt, hint };
    }
    if (this.pendingInputs.length === 0) {
      return { alive, settled: 'idle' as const, lastActivityAt: this.lastSdkEventAt, hint };
    }
    return { alive, lastActivityAt: this.lastSdkEventAt, hint };
  }

  private handleThreadEvent(event: ThreadEvent): ThreadEventDispatchResult {
    let turnFailure: string | undefined;
    for (const converted of this.converter.convertEvent(event, this.modelId)) {
      if (converted.kind === 'turn-failure') {
        turnFailure = converted.error;
        continue;
      }
      this.dispatch(converted);
    }
    return turnFailure === undefined ? {} : { turnFailure };
  }

  private dispatch(event: ConvertedCodexEvent) {
    if (event.kind === 'agent-trace') {
      this.emitTrace(event.trace.type, event.trace.data);
    } else if (event.kind === 'usage') {
      this.emitUsage(event.usage);
    } else if (event.kind === 'thread-id') {
      this.captureThreadId(event.threadId);
    }
  }

  private captureThreadId(threadId: string) {
    if (threadId === this.threadId) {
      return;
    }
    this.threadId = threadId;
    this.emitMetadataUpdate({ threadId });
  }

  private openThread(workspacePath: string): Thread {
    const options = this.buildThreadOptions(workspacePath);
    if (this.threadId !== undefined && this.threadId.length > 0) {
      return this.codex.resumeThread(this.threadId, options);
    }
    return this.codex.startThread(options);
  }

  private buildThreadOptions(workspacePath: string): CodexThreadOptions {
    const cwd = workspacePath.length > 0 ? workspacePath : this.defaultCwd;
    const options: CodexThreadOptions = {
      sandboxMode: 'danger-full-access',
      approvalPolicy: 'never',
      skipGitRepoCheck: true,
    };
    if (cwd !== undefined) {
      options.workingDirectory = cwd;
    }
    return options;
  }

  private cellsToPrompt(cells: DataCells, systemPrompt: string, hasWarmThread: boolean): string {
    const userText = cells.map((cell) => cellToString(cell)).join('\n');
    // The Codex SDK has no separate system prompt channel — the CLI reads
    // the user's `~/.codex/instructions.md` for persistent guidance. To
    // match Claude Code semantics we inject the registry-supplied system
    // prompt as a prefix on the first prompt of the session only, so warm
    // turns don't re-send it.
    if (!hasWarmThread && systemPrompt.length > 0) {
      return `${systemPrompt}\n\n${userText}`;
    }
    return userText;
  }

  private enqueueInput(prompt: string) {
    this.pendingInputs.push(prompt);
    const resolver = this.inputResolver;
    this.inputResolver = undefined;
    resolver?.();
  }

  private async *inputStream(): AsyncGenerator<string> {
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
