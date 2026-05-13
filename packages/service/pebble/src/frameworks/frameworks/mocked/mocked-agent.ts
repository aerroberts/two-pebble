import type { UsageReport } from '../../../pricing';
import type { PebbleAgentTrace } from '../../../traces';
import { ThirdPartyAgentFramework } from '../..';
import type { AgentFrameworkStatusEvent, AgentFrameworkSubmitMessageInput } from '../../types';

/**
 * A mocked agent framework is used for testing purposes.
 * It accepts no real input and emits no real output by default; tests drive
 * its behavior through the `emitMocked*` helpers to simulate framework events.
 */
export class MockedAgent extends ThirdPartyAgentFramework {
  public readonly frameworkId = 'mocked';
  public submittedMessages: AgentFrameworkSubmitMessageInput[] = [];

  /**
   * Records the submitted message and emits a synthetic 'working' status so
   * the wrapping FrameworkAgent flips to running just like a real adapter
   * would. Tests that want a different lifecycle drive it through
   * emitMockedStatusChange after the fact.
   */
  public async submitMessage(input: AgentFrameworkSubmitMessageInput): Promise<void> {
    this.submittedMessages.push(input);
    this.emitStatusChange({ status: 'working' });
  }

  /**
   * Emits a mocked usage report for tests that assert on usage handling.
   * Forwards the report verbatim to the framework's usage listeners.
   */
  public emitMockedUsage(usage: UsageReport) {
    this.emitUsage(usage);
  }

  /**
   * Emits a mocked trace for tests that assert on trace fan-out.
   * Forwards the trace's type and data to the framework's trace listeners.
   */
  public emitMockedTrace(trace: PebbleAgentTrace) {
    this.emitTrace(trace.type, trace.data);
  }

  /**
   * Emits a mocked status change so tests can drive the agent's lifecycle.
   * Useful for asserting how FrameworkAgent reacts to working/idle events.
   */
  public emitMockedStatusChange(event: AgentFrameworkStatusEvent) {
    this.emitStatusChange(event);
  }
}
