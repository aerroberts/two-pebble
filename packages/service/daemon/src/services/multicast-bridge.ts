import type { DaemonBridge } from '../types';

/**
 * Bridge-shaped fan-out used by daemon-owned services (the liveness
 * reconciler, the rehydrator) when emitting events to clients without
 * having a single owning client. Listeners go to every currently
 * connected bridge so the realtime layer in every UI instance stays
 * in sync. Receive paths are not supported — this object only
 * implements the `emit` method that consumers actually need.
 */
export class MulticastBridge {
  private readonly targets: Set<DaemonBridge>;

  public constructor(targets: Set<DaemonBridge>) {
    this.targets = targets;
  }

  public emit(event: string, payload: unknown): void {
    for (const target of this.targets) {
      try {
        (target.emit as (e: string, p: unknown) => void)(event, payload);
      } catch {
        // Drop emits to a closed bridge silently; disconnection is handled elsewhere.
      }
    }
  }
}

export function asDaemonBridge(multicast: MulticastBridge): DaemonBridge {
  return multicast as unknown as DaemonBridge;
}
