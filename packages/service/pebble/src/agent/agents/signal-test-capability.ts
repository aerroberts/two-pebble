import { z } from 'zod/v4';
import { AgentCapability, NativeTool, ToolResponse } from '../../agent';
import { Cell } from '../../thread';
import type { AgentSignal } from '../signal-runner';

/**
 * Test capability that opens a deterministic awaited signal.
 * It records received signal messages so the test can assert that the
 * resumed agent delivered signal data back into the capability hook.
 */
export class SignalTestCapability extends AgentCapability {
  public readonly id = 'signal-test';
  public readonly description = 'Registers a test signal.';
  public readonly receivedMessages: string[] = [];

  /**
   * Registers the single test tool that moves the agent into waiting on a signal.
   * The signal id is deterministic so assertions can inspect the in-memory
   * runner without searching generated ids.
   */
  public override hookOnRegister() {
    return {
      tools: [
        new NativeTool({
          description: 'Register a test signal.',
          name: 'wait-for-signal',
          schema: z.object({}),
        }).onInvoke(async () => {
          await this.registerSignal({
            description: 'Wait for test signal.',
            name: 'Test signal',
            signalId: 'signal-test',
          });
          return ToolResponse.success([Cell.text('Waiting.')]);
        }),
      ],
    };
  }

  /**
   * Captures received signal data for the test assertion.
   * Only object payloads with a string `message` field are meaningful for
   * this fixture.
   */
  public override hookOnSignal(signal: AgentSignal): void {
    const data = signal.data;
    if (data !== null && typeof data === 'object' && !Array.isArray(data) && typeof data.message === 'string') {
      this.receivedMessages.push(data.message);
    }
  }
}
