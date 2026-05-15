import path from 'node:path';
import { Datastore } from '@two-pebble/datastore';
import { FileSyncSink, logger, PrettySink, TeeSink } from '@two-pebble/logger';
import { metrics } from '@two-pebble/metrics';
import { WsBridgeServer } from '@two-pebble/ws-bridge';
import { registerDaemonHandlers } from './register-daemon-handlers';
import { AgentRegistryService } from './services/agent-registry-service';
import { AutomationService } from './services/automation-service';
import { HeartbeatService } from './services/heartbeat-service';
import { LivenessReconciler } from './services/liveness-reconciler';
import { MulticastBridge } from './services/multicast-bridge';
import { asDaemonBridge } from './services/multicast-bridge-cast';
import { TaskBoardService } from './services/task-board-service';
import type {
  AgentLivenessPayload,
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
  private heartbeat?: HeartbeatService;
  private reconciler?: LivenessReconciler;

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
   * Migrates storage and starts the WebSocket protocol server.
   * If the preferred port is busy, increments up to portRange-1 times before
   * giving up. The datastore is created against the actual bound port so each
   * concurrent daemon instance owns its own SQLite file.
   */
  public async launch(): Promise<void> {
    logger.info('ws server launching', { hostname: this.input.host, port: this.input.port });
    this.server = await this.bindServer();
    const databaseFilePath = this.resolveDatabaseFilePath(this.server.port);
    this.datastore = new Datastore({ databaseFilePath });
    await this.datastore.migrate();
    this.registerMetricsSink(this.datastore);
    const multicastBridge = asDaemonBridge(new MulticastBridge(this.bridges));
    const taskBoards = new TaskBoardService({ datastore: this.datastore, logger });
    const agentRegistry = new AgentRegistryService({
      datastore: this.datastore,
      logger,
      multicastBridge,
      taskBoards,
    });
    await agentRegistry.hydrate();
    await taskBoards.hydrate();
    const heartbeat = new HeartbeatService({ bridge: multicastBridge, datastore: this.datastore, logger });
    const automations = new AutomationService({
      agentRegistry,
      bridge: multicastBridge,
      datastore: this.datastore,
      heartbeat,
      logger,
    });
    await automations.hydrate();
    heartbeat.start();
    this.heartbeat = heartbeat;
    this.context = {
      agentRegistry,
      automations,
      databaseFilePath,
      datastore: this.datastore,
      heartbeat,
      logger,
      logsDirectoryPath: path.dirname(this.input.logFilePath),
      multicastBridge,
      port: this.server.port,
      taskBoards,
    };
    this.server.onClientConnected((bridge) => this.connect(bridge));
    this.server.onClientDisconnected((bridge) => this.disconnect(bridge));
    this.reconciler = new LivenessReconciler({
      agentRegistry,
      broadcast: (payload) => this.broadcastLiveness(payload),
      daemonBootId: this.daemonBootId,
      datastore: this.datastore,
      logger,
    });
    this.reconciler.start();
    this.context.livenessReconciler = this.reconciler;
    logger.info('ws server launched', { hostname: this.hostname, port: this.port, daemonBootId: this.daemonBootId });
    logger.info('database', { path: databaseFilePath });
    logger.info('ui served from', { directory: uiDistDirectory() });
    logger.info('ui available at', { url: `http://${this.hostname}:${this.port}` });
  }

  private async bindServer(): Promise<DaemonServer> {
    const range = Math.max(1, this.input.portRange ?? 1);
    let lastError: Error | undefined;
    for (let offset = 0; offset < range; offset += 1) {
      const port = this.input.port + offset;
      const candidate = new WsBridgeServer({
        hostname: this.input.host,
        port,
        fetch: (request) => this.fetch(request),
      });
      try {
        await candidate.launch();
        return candidate;
      } catch (error) {
        const wrapped = error instanceof Error ? error : new Error(String(error));
        lastError = wrapped;
        if (!this.isAddressInUseError(wrapped)) {
          throw wrapped;
        }
        logger.info('port busy, trying next', { port });
      }
    }
    throw lastError ?? new Error('Daemon could not bind any port in the requested range.');
  }

  private isAddressInUseError(error: Error): boolean {
    return (error as Error & { code?: string }).code === 'EADDRINUSE';
  }

  private resolveDatabaseFilePath(port: number): string {
    if (this.input.databaseFilePath !== undefined) {
      return this.input.databaseFilePath;
    }
    if (this.input.databaseFilePathForPort !== undefined) {
      return this.input.databaseFilePathForPort(port);
    }
    throw new Error('TwoPebbleDaemon requires databaseFilePath or databaseFilePathForPort.');
  }

  /**
   * Stops the protocol server and closes the datastore connection.
   * This is idempotent from the caller's perspective.
   * It should be called during process shutdown and tests.
   */
  public async close(): Promise<void> {
    logger.info('ws server closing');
    metrics.shutdown();
    this.heartbeat?.stop();
    this.reconciler?.stop();
    this.server?.close();
    if (this.datastore !== undefined) {
      await this.datastore.close();
    }
    logger.info('ws server closed');
  }

  private broadcastLiveness(payload: AgentLivenessPayload): void {
    for (const bridge of this.bridges) {
      try {
        bridge.emit('agentLiveness', payload);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logger.warn('agent liveness broadcast failed', { error: message });
      }
    }
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
