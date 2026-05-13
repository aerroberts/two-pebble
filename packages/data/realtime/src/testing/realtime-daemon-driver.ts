import type { ClientProtocol } from '@two-pebble/protocol';
import { WsBridgeClient } from '@two-pebble/ws-bridge';
import { act } from 'react';
import type {
  AttachedRealtimeDatastore,
  DirectDaemonClient,
  MaybeRealtimeDatastore,
  RealtimeDaemonDriverInput,
  RealtimeOperationName,
  RealtimeOperationPayload,
  RealtimeOperationResponse,
} from './types';

/**
 * Sends protocol operations through the rendered realtime client.
 * Tests use this as the daemon-facing command surface.
 * The same websocket client receives resulting realtime events.
 */
export class RealtimeDaemonDriver {
  private readonly input: RealtimeDaemonDriverInput;
  private datastore: MaybeRealtimeDatastore = null;

  public constructor(input: RealtimeDaemonDriverInput) {
    this.input = input;
  }

  /**
   * Attaches the datastore created by the rendered provider.
   * The hook renderer calls this when the provider connects.
   * Operations before attachment are treated as invalid test setup.
   */
  public attach(datastore: AttachedRealtimeDatastore): void {
    this.datastore = datastore;
  }

  /**
   * Sends a daemon protocol operation over the active websocket.
   * The operation is handled by the real daemon and durable datastore.
   * Realtime events are delivered back into the rendered hook state.
   */
  public async do<TName extends RealtimeOperationName>(
    operation: TName,
    payload: RealtimeOperationPayload<TName>,
  ): Promise<RealtimeOperationResponse<TName>> {
    if (this.datastore === null) {
      throw new Error('Realtime hook must be rendered before daemon operations can run.');
    }

    const datastore = this.datastore;
    let response: RealtimeOperationResponse<TName> = {} as RealtimeOperationResponse<TName>;

    await act(async () => {
      response = (await datastore.emit(operation as never, payload as never)) as RealtimeOperationResponse<TName>;
    });

    return response as RealtimeOperationResponse<TName>;
  }

  /**
   * Runs an operation before a hook is rendered.
   * This seeds daemon datastore state through the real websocket protocol.
   * The temporary client closes before realtime hook assertions begin.
   */
  public async backfill<TName extends RealtimeOperationName>(
    operation: TName,
    payload: RealtimeOperationPayload<TName>,
  ): Promise<RealtimeOperationResponse<TName>> {
    const client = await this.connectDirectClient();

    try {
      return (await client.do(operation as never, payload as never)) as RealtimeOperationResponse<TName>;
    } finally {
      client.close();
    }
  }

  private async connectDirectClient(): Promise<DirectDaemonClient> {
    const client = new WsBridgeClient<ClientProtocol>({ url: this.input.url });
    await client.connect(() => undefined);
    return client;
  }
}
