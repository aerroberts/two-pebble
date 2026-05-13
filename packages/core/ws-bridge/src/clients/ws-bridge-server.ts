import type { Server, ServerWebSocket } from 'bun';
import { Bridge } from '../bridge/bridge';
import type {
  BridgeProtocol,
  Message,
  WsBridgeServerClientHandler,
  WsBridgeServerInput,
  WsBridgeSocketData,
} from '../protocol';

/**
 * Bun WebSocket server that wires each connection to a Bridge.
 * Call launch to start listening.
 * Client connection handlers receive direct Bridge access.
 */
export class WsBridgeServer<Protocol extends BridgeProtocol> {
  private readonly bridges = new Map<ServerWebSocket<WsBridgeSocketData>, Bridge<Protocol>>();
  private readonly connectedHandlers: WsBridgeServerClientHandler<Protocol>[] = [];
  private readonly disconnectedHandlers: WsBridgeServerClientHandler<Protocol>[] = [];
  private readonly input: WsBridgeServerInput;
  private server: Server<WsBridgeSocketData> | null = null;

  public constructor(input: WsBridgeServerInput) {
    this.input = input;
  }

  /**
   * Returns the listening hostname.
   * The value comes from the owned Bun server after launch.
   * Before launch it reflects the configured hostname.
   */
  public get hostname() {
    return this.server?.hostname ?? this.input.hostname ?? '127.0.0.1';
  }

  /**
   * Returns the listening port.
   * The value is assigned by Bun after launch, including dynamic port zero.
   * Before launch it reflects the configured port.
   */
  public get port() {
    return this.server?.port ?? this.input.port;
  }

  /**
   * Starts the owned Bun WebSocket server.
   * Throws on bind failure (e.g. EADDRINUSE); callers decide retry policy.
   * Client handlers can be registered before or after launch.
   */
  public async launch(): Promise<void> {
    this.server = Bun.serve<WsBridgeSocketData>({
      hostname: this.input.hostname ?? '127.0.0.1',
      port: this.input.port,
      fetch: (request, server) => this.fetch(request, server),
      websocket: {
        open: (socket) => this.open(socket),
        message: (socket, raw) => this.message(socket, raw),
        close: (socket) => this.closeSocket(socket),
      },
    });
  }

  /**
   * Registers a callback for new WebSocket clients.
   * The callback receives the per-client Bridge.
   * Register operations, listeners, and initial events there.
   */
  public onClientConnected(handler: WsBridgeServerClientHandler<Protocol>): void {
    this.connectedHandlers.push(handler);
  }

  /**
   * Registers a callback for WebSocket disconnects.
   * The callback receives the same Bridge created at connect time.
   * Use this to clean up connection tracking.
   */
  public onClientDisconnected(handler: WsBridgeServerClientHandler<Protocol>): void {
    this.disconnectedHandlers.push(handler);
  }

  /**
   * Stops the owned Bun server.
   * Existing WebSocket connections are closed by Bun.
   * No additional bridge events are emitted.
   */
  public close(): void {
    this.server?.stop(true);
    this.server = null;
  }

  private async fetch(request: Request, server: Server<WsBridgeSocketData>) {
    const response = await this.input.fetch?.(request);
    if (response !== undefined) {
      return response;
    }
    if (server.upgrade(request, { data: null })) {
      return undefined;
    }
    return new Response('WebSocket upgrade required.', { status: 426 });
  }

  private open(socket: ServerWebSocket<WsBridgeSocketData>) {
    const bridge = new Bridge<Protocol>();
    bridge.onSendMessage((message) => {
      const raw = JSON.stringify(message);
      this.input.captureWireMessage?.({ endpoint: 'server', direction: 'sent', raw });
      socket.send(raw);
    });
    this.bridges.set(socket, bridge);

    for (const handler of this.connectedHandlers) {
      handler(bridge);
    }
  }

  private message(socket: ServerWebSocket<WsBridgeSocketData>, raw: string | Buffer) {
    const bridge = this.bridges.get(socket);
    if (bridge === undefined) {
      return;
    }
    const text = typeof raw === 'string' ? raw : new TextDecoder().decode(raw);
    this.input.captureWireMessage?.({ endpoint: 'server', direction: 'received', raw: text });
    void bridge.receiveMessage(JSON.parse(text) as Message);
  }

  private closeSocket(socket: ServerWebSocket<WsBridgeSocketData>) {
    const bridge = this.bridges.get(socket);
    if (bridge !== undefined) {
      for (const handler of this.disconnectedHandlers) {
        handler(bridge);
      }
    }
    this.bridges.delete(socket);
  }
}
