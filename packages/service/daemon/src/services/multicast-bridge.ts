import type { DaemonBridge, DaemonOutboundEventName, DaemonOutboundPayload } from '../types';

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

  /**
   * Emits an outbound daemon event to every connected bridge.
   * Closed or already-disconnected bridge targets are skipped so one
   * stale client cannot block realtime fan-out to active clients.
   */
  public emit<TName extends DaemonOutboundEventName>(event: TName, payload: DaemonOutboundPayload<TName>): void {
    for (const target of this.targets) {
      try {
        target.emit(event as never, payload as never);
      } catch {
        // Drop emits to a closed bridge silently; disconnection is handled elsewhere.
      }
    }
  }
}
