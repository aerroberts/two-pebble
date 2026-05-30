import type { BridgeProtocol } from '@two-pebble/ws-bridge';
import type { DaemonEvents } from './daemon-events';
import type { DaemonOperations } from './daemon-operations';

export type { DaemonEvents } from './daemon-events';
// The operation and event manifests live in sibling files to keep each module
// reviewable; re-export them here so the protocol's public surface is unchanged.
export type { DaemonOperations } from './daemon-operations';

/**
 * Describes the protocol surface available to the client side of the bridge.
 * Client code sends daemon operations and receives daemon events through this type.
 */
export interface ClientProtocol
  extends BridgeProtocol<
    {
      operations: DaemonOperations;
      events: [];
    },
    {
      operations: [];
      events: DaemonEvents;
    }
  > {}

/**
 * Describes the protocol surface implemented by the daemon side of the bridge.
 * Daemon code receives client operations and publishes daemon events through this type.
 */
export interface DaemonProtocol
  extends BridgeProtocol<
    {
      operations: [];
      events: DaemonEvents;
    },
    {
      operations: DaemonOperations;
      events: [];
    }
  > {}
