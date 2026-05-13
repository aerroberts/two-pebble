import { act } from 'react';
import { waitForStepMs, waitForTimeoutMs } from './consts';
import type { RealtimeRenderedHookValueInput, RealtimeWaitPredicate } from './types';

/**
 * Holds the latest value emitted by a rendered hook.
 * Tests poll this object after daemon operations.
 * The root is unmounted when the context closes.
 */
export class RealtimeRenderedHookValue<TValue> {
  private readonly input: RealtimeRenderedHookValueInput<TValue>;

  public constructor(input: RealtimeRenderedHookValueInput<TValue>) {
    this.input = input;
  }

  /**
   * Returns the latest hook value captured during render.
   * The value updates whenever React rerenders the probe.
   * Call wait helpers before asserting async state.
   */
  public current(): TValue {
    return this.input.value();
  }

  /**
   * Unmounts the React root that owns the realtime provider.
   * This closes the websocket through provider cleanup.
   * Tests normally call the parent context close method.
   */
  public close(): void {
    this.input.root.unmount();
  }

  /**
   * Waits until a loadable registry has a specific item count.
   * This is intentionally narrow for realtime state assertions.
   * It keeps test cases short and focused on observable state.
   */
  public async waitForItemCount(count: number): Promise<TValue> {
    return this.waitFor((value) => this.itemCount(value) === count);
  }

  /**
   * Waits until a loadable value reports a specific status.
   * Realtime list hooks use this after their initial refresh.
   * It returns the matching hook value for direct assertions.
   */
  public async waitForStatus(status: string): Promise<TValue> {
    return this.waitFor((value) => this.status(value) === status);
  }

  /**
   * Waits until the hook has produced any value at all.
   * Provider connection is async, so initial render may be absent.
   * The hook driver uses this before returning to tests.
   */
  public async waitForValue(): Promise<TValue> {
    return this.waitFor((value) => value !== null);
  }

  /**
   * Waits until the current hook value satisfies a predicate.
   * Callers use this for state transitions that are not simple counts.
   * The latest matching hook value is returned for assertion.
   */
  public async waitFor(predicate: RealtimeWaitPredicate<TValue>): Promise<TValue> {
    const deadline = Date.now() + waitForTimeoutMs;

    while (Date.now() < deadline) {
      const value = this.current();
      if (predicate(value)) {
        return value;
      }
      await act(async () => {
        await Bun.sleep(waitForStepMs);
      });
    }

    throw new Error('Timed out waiting for realtime hook state.');
  }

  private itemCount(value: TValue): number | null {
    if (typeof value !== 'object' || value === null || !('values' in value)) {
      return null;
    }

    const list = value.values;
    if (typeof list !== 'function') {
      return null;
    }

    return list.call(value).length;
  }

  private status(value: TValue): string | null {
    if (typeof value !== 'object' || value === null || !('status' in value)) {
      return null;
    }

    const status = value.status;
    return typeof status === 'string' ? status : null;
  }
}
