import type { Datastore } from '@two-pebble/datastore';
import type { DaemonEventSink, DaemonHeartbeatInput, DaemonHeartbeatReport } from '../types';

/**
 * Registry that owns the daemon's services. It holds the shared datastore and
 * event sink, registers each service exactly once by id, and resolves services
 * for cross-service lookups.
 */
export class DaemonServiceHost {
  private readonly serviceList: DaemonService[] = [];
  public readonly datastore: Datastore;
  public readonly events: DaemonEventSink;

  public constructor(input: { datastore: Datastore; events: DaemonEventSink }) {
    this.datastore = input.datastore;
    this.events = input.events;
  }

  public get services(): readonly DaemonService[] {
    return this.serviceList;
  }

  public register<TService extends DaemonService>(service: TService): TService {
    if (this.serviceList.some((candidate) => candidate.id === service.id)) {
      throw new Error(`Daemon service already registered: ${service.id}`);
    }
    this.serviceList.push(service);
    return service;
  }

  public requireService<TService extends DaemonService>(id: string): TService {
    const service = this.serviceList.find((candidate) => candidate.id === id);
    if (service === undefined) {
      throw new Error(`Daemon service not registered: ${id}`);
    }
    return service as TService;
  }
}

export abstract class DaemonService {
  public abstract readonly id: string;
  protected readonly daemon: DaemonServiceHost;

  public constructor(daemon: DaemonServiceHost) {
    this.daemon = daemon;
  }

  public initialize(): void | Promise<void> {}

  public shutdown(): void | Promise<void> {}

  public onHeartbeat(
    _input: DaemonHeartbeatInput,
  ): undefined | Promise<DaemonHeartbeatReport | DaemonHeartbeatReport[] | undefined> {
    return undefined;
  }
}
