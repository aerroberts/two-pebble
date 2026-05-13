import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { HookProbe } from './hook-probe';
import { RealtimeConnectionWrapper } from './realtime-connection-wrapper';
import { RealtimeRenderedHookValue } from './realtime-rendered-hook-value';
import { setupDom } from './setup-dom';
import type { RealtimeHook, RealtimeHookDriverInput, RealtimeRenderedHook } from './types';

/**
 * Renders realtime hooks inside the real realtime provider.
 * Each render creates a websocket connection to the daemon.
 * The daemon driver is attached to that same connection.
 */
export class RealtimeHookDriver {
  private readonly input: RealtimeHookDriverInput;

  public constructor(input: RealtimeHookDriverInput) {
    this.input = input;
  }

  /**
   * Renders one hook and waits for the provider to connect.
   * The returned handle exposes the latest hook value.
   * Tests can then issue daemon operations and wait for state changes.
   */
  public async renderHook<TValue>(hook: RealtimeHook<TValue>): Promise<RealtimeRenderedHook<TValue>> {
    setupDom();

    let current: TValue | null = null;
    const element = document.createElement('div');
    document.body.appendChild(element);
    const root = createRoot(element);

    await act(async () => {
      root.render(
        <RealtimeConnectionWrapper url={this.input.url}>
          <HookProbe
            hook={hook}
            onDatastore={(datastore) => this.input.daemon.attach(datastore)}
            onValue={(value) => {
              current = value;
            }}
          />
        </RealtimeConnectionWrapper>,
      );
    });

    const rendered = new RealtimeRenderedHookValue({ root, value: () => current as TValue });
    await rendered.waitForValue();
    return rendered;
  }
}
