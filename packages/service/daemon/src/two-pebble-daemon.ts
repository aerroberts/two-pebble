import path from 'node:path';
import { Datastore } from '@two-pebble/datastore';
import { FileSyncSink, logger, PrettySink, TeeSink } from '@two-pebble/logger';
import { metrics } from '@two-pebble/metrics';
import { WsBridgeServer } from '@two-pebble/ws-bridge';
import { MulticastEventSink } from './events/multicast-event-sink';
import { registerDaemonHandlers } from './register-daemon-handlers';
import { AgentRegistryService } from './services/agent-registry/service';
import { AutomationService } from './services/automation';
import { DaemonServiceHost } from './services/daemon-service';
import { GithubService } from './services/github';
import { HeartbeatService } from './services/heartbeat';
import { LivenessService } from './services/liveness/service';
import { QueuedMessagesDispatcherService } from './services/queued-messages/service';
import { TaskBoardService } from './services/task-board/service';
import type {
  DaemonBridge,
  DaemonFetchResponse,
  DaemonHandlerContext,
  DaemonOperationHandler,
  DaemonOperationName,
  DaemonRuntimeContext,
  DaemonServer,
  TwoPebbleDaemonInput,
} from './types';
import { listDebugLogFiles } from './utils/debug-logs/debug.logs.file';
import { serveUiRequest, uiDistDirectory } from './utils/serve-ui';

/**
 * Owns the local daemon runtime for Two Pebble.
 * The daemon combines durable datastore state with the protocol WebSocket.
 * UI clients reach daemon behavior only through registered bridge handlers.
 */
export class TwoPebbleDaemon {
  private readonly input: TwoPebbleDaemonInput;
  private readonly daemonBootId: string = crypto.randomUUID();
  private readonly bridges = new Set<DaemonBridge>();
  private context?: DaemonRuntimeContext;
  private datastore?: Datastore;
  private server?: DaemonServer;
  private serviceHost?: DaemonServiceHost;

  public constructor(input: TwoPebbleDaemonInput) {
    logger.useSink(
      new TeeSink([new PrettySink({ output: process.stdout }), new FileSyncSink({ filePath: input.logFilePath })]),
    );
    this.input = input;
  }

  /**
   * Returns the hostname for the owned protocol server.
   * Before launch it reflects the configured hostname; after launch it
   * reflects the value Bun reports for the bound socket.
   */
  public get hostname() {
    return this.server?.hostname ?? this.input.host;
  }

  /**
   * Returns the port the daemon is bound to.
   * Before launch it reflects the input hint; after launch it reflects the
   * actual port resolved by the EADDRINUSE retry loop.
   */
  public get port() {
    return this.server?.port ?? this.input.port;
  }

  /**
   * Migrates storage and starts the WebSocket protocol server on the
   * hardcoded daemon port. EADDRINUSE is fatal; the daemon assumes one
   * instance per host.
   */
  public async launch(): Promise<void> {
    logger.info('ws server launching', { hostname: this.input.host, port: this.input.port });
    this.server = await this.bindServer();
    const databaseFilePath = this.input.databaseFilePath;
    this.datastore = new Datastore({ databaseFilePath });
    await this.datastore.migrate();
    this.registerMetricsSink(this.datastore);
    const events = new MulticastEventSink(this.bridges);
    const serviceHost = new DaemonServiceHost({ datastore: this.datastore, events });
    this.serviceHost = serviceHost;
    const taskBoards = serviceHost.register(new TaskBoardService(serviceHost));
    const agentRegistry = serviceHost.register(new AgentRegistryService(serviceHost));
    const queuedMessages = serviceHost.register(new QueuedMessagesDispatcherService(serviceHost));
    const automations = serviceHost.register(new AutomationService(serviceHost));
    const github = serviceHost.register(new GithubService(serviceHost));
    const heartbeat = serviceHost.register(new HeartbeatService(serviceHost));
    const liveness = serviceHost.register(new LivenessService(serviceHost, { daemonBootId: this.daemonBootId }));
    await agentRegistry.initialize();
    await taskBoards.initialize();
    await queuedMessages.initialize();
    await automations.initialize();
    heartbeat.initialize();
    this.context = {
      agentRegistry,
      automations,
      databaseFilePath,
      datastore: this.datastore,
      events,
      github,
      heartbeat,
      logsDirectoryPath: path.dirname(this.input.logFilePath),
      port: this.server.port,
      queuedMessages,
      taskBoards,
      liveness,
    };
    this.server.onClientConnected((bridge) => this.connect(bridge));
    this.server.onClientDisconnected((bridge) => this.disconnect(bridge));
    liveness.initialize();
    logger.info('ws server launched', { hostname: this.hostname, port: this.port, daemonBootId: this.daemonBootId });
    logger.info('database', { path: databaseFilePath });
    logger.info('ui served from', { directory: uiDistDirectory() });
    logger.info('ui available at', { url: `http://${this.hostname}:${this.port}` });
  }

  private async bindServer(): Promise<DaemonServer> {
    const candidate = new WsBridgeServer({
      hostname: this.input.host,
      port: this.input.port,
      fetch: (request) => this.fetch(request),
    });
    await candidate.launch();
    return candidate;
  }

  /**
   * Stops the protocol server and closes the datastore connection.
   * This is idempotent from the caller's perspective.
   * It should be called during process shutdown and tests.
   */
  public async close(): Promise<void> {
    logger.info('ws server closing');
    metrics.shutdown();
    for (const service of [...(this.serviceHost?.services ?? [])].reverse()) {
      await service.shutdown();
    }
    this.server?.close();
    if (this.datastore !== undefined) {
      await this.datastore.close();
    }
    logger.info('ws server closed');
  }

  private disconnect(bridge: DaemonBridge): void {
    this.bridges.delete(bridge);
  }

  private registerMetricsSink(datastore: Datastore): void {
    metrics.onMetric((entry) => {
      datastore.metrics
        .write({
          name: entry.name,
          value: entry.value,
          dimensions: entry.dimensions,
          timestamp: entry.timestamp,
        })
        .catch((error) => {
          logger.warn('metric write failed', { error: error instanceof Error ? error : String(error) });
        });
    });
  }

  private connect(bridge: DaemonBridge): void {
    logger.info('ws client connected');
    if (this.context === undefined) {
      throw new Error('Daemon context unavailable; launch must complete before connect.');
    }
    this.bridges.add(bridge);
    const context: DaemonHandlerContext = this.context;
    registerDaemonHandlers(context, (operation, handler) => {
      this.registerOperation(bridge, operation, handler);
    });
  }

  private registerOperation<TName extends DaemonOperationName>(
    bridge: DaemonBridge,
    operation: TName,
    handler: DaemonOperationHandler<TName>,
  ): void {
    bridge.on<TName>(operation, this.wrapOperation(bridge, operation, handler) as never);
  }

  private wrapOperation<TName extends DaemonOperationName>(
    bridge: DaemonBridge,
    operation: TName,
    handler: DaemonOperationHandler<TName>,
  ): DaemonOperationHandler<TName> {
    const instrumented = metrics.wrap('daemon.operation', handler, { operation }) as DaemonOperationHandler<TName>;
    return async (payload) => {
      logger.info('daemon operation', { operation });
      try {
        const response = await instrumented(payload);
        this.emitDebugLogUpdated(bridge);
        return response;
      } catch (error) {
        logger.warn('daemon operation failed', {
          error: error instanceof Error ? error : String(error),
          operation,
        });
        this.emitDebugLogUpdated(bridge);
        throw error;
      }
    };
  }

  private emitDebugLogUpdated(bridge: DaemonBridge): void {
    if (this.context === undefined) {
      return;
    }
    const [log] = listDebugLogFiles(this.context.logsDirectoryPath);
    if (log !== undefined) {
      bridge.emit('debugLogUpdated', log);
    }
  }

  private async fetch(request: Request): Promise<DaemonFetchResponse> {
    const url = new URL(request.url);
    if (url.pathname === '/health') {
      return Response.json({ state: 'ready' });
    }
    if (this.isWebSocketUpgrade(request)) {
      return undefined;
    }
    return serveUiRequest(request);
  }

  private isWebSocketUpgrade(request: Request): boolean {
    return request.headers.get('upgrade')?.toLowerCase() === 'websocket';
  }
}
