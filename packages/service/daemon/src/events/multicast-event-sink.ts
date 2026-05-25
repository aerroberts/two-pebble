import type { DaemonBridge, DaemonEventSink, DaemonOutboundEventName, DaemonOutboundPayload } from '../types';

/**
 * Event sink used by daemon-owned services when emitting events to
 * clients without having a single owning client. Services receive this
 * narrowed sink instead of a protocol bridge.
 */
export class MulticastEventSink implements DaemonEventSink {
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
