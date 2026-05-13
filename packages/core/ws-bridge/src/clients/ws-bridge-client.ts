import { Bridge } from '../bridge/bridge';
import type {
  BridgeProtocol,
  Message,
  ProtocolEventByName,
  ProtocolInboundEvents,
  ProtocolOpByName,
  ProtocolOutboundEvents,
  ProtocolOutboundOps,
  WebSocketLike,
  WsBridgeClientInput,
  WsBridgeClientSetup,
} from '../protocol';

/**
 * Browser-side WebSocket bridge client.
 * It creates a WebSocket when connect is called.
 * The internal Bridge is exposed during setup.
 */
export class WsBridgeClient<Protocol extends BridgeProtocol> {
  private readonly bridge = new Bridge<Protocol>();
  private readonly input: WsBridgeClientInput;
  private readonly queue: Message[] = [];
  private socket: WebSocketLike | null = null;

  public constructor(input: WsBridgeClientInput) {
    this.input = input;
    this.setupBridge();
  }

  /**
   * Opens the WebSocket and exposes the Bridge before the connection starts.
   * Setup can register listeners and handlers before remote messages arrive.
   * The promise resolves after the socket open event fires.
   */
  public async connect(setup: WsBridgeClientSetup<Protocol>): Promise<void> {
    setup(this.bridge);

    await new Promise<void>((resolve, reject) => {
      const socket = new WebSocket(this.input.url);
      this.socket = socket;
      this.setupSocket(socket, resolve, reject);
    });
  }

  /**
   * Calls an outbound operation over this client's WebSocket.
   * The request is routed through the internal bridge.
   * The promise resolves with the remote operation response.
   */
  public async do<TName extends ProtocolOutboundOps<Protocol>[number]['name']>(
    operation: TName,
    payload: ProtocolOpByName<ProtocolOutboundOps<Protocol>, TName>['request'],
  ): Promise<ProtocolOpByName<ProtocolOutboundOps<Protocol>, TName>['response']> {
    return this.bridge.do(operation, payload);
  }

  /**
   * Subscribes to an inbound event from the remote endpoint.
   * The listener is registered on the internal bridge.
   * The returned function unsubscribes the listener.
   */
  public listen<TName extends ProtocolInboundEvents<Protocol>[number]['name']>(
    event: TName,
    handler: (payload: ProtocolEventByName<ProtocolInboundEvents<Protocol>, TName>['payload']) => void,
  ) {
    return this.bridge.listen(event, handler);
  }

  /**
   * Emits an outbound event to the remote endpoint.
   * The event is serialized and sent over the owned WebSocket.
   * If the socket is not open yet, the message is queued.
   */
  public emit<TName extends ProtocolOutboundEvents<Protocol>[number]['name']>(
    event: TName,
    payload: ProtocolEventByName<ProtocolOutboundEvents<Protocol>, TName>['payload'],
  ): void {
    this.bridge.emit(event, payload);
  }

  /**
   * Closes the owned WebSocket connection.
   * Pending messages are discarded by the socket implementation.
   * No remote operation is invoked.
   */
  public close(): void {
    this.socket?.close();
  }

  private setupBridge() {
    this.bridge.onSendMessage((message) => {
      if (this.socket?.readyState === this.openReadyState()) {
        this.send(message);
        return;
      }
      this.queue.push(message);
    });
  }

  private setupSocket(socket: WebSocketLike, resolve: () => void, reject: (error: Error) => void) {
    let opened = false;
    let settled = false;
    const timeout = setTimeout(() => {
      if (settled) {
        return;
      }
      settled = true;
      socket.close();
      reject(new Error(`WebSocket connection timed out: ${this.input.url}`));
    }, this.connectTimeoutMs());

    socket.addEventListener('open', () => {
      if (settled) {
        return;
      }
      settled = true;
      opened = true;
      clearTimeout(timeout);
      this.flush();
      resolve();
    });

    socket.addEventListener('error', () => {
      if (!opened && !settled) {
        settled = true;
        clearTimeout(timeout);
        reject(new Error(`WebSocket connection failed: ${this.input.url}`));
      }
    });

    socket.addEventListener('close', () => {
      if (!opened && !settled) {
        settled = true;
        clearTimeout(timeout);
        reject(new Error(`WebSocket connection closed before opening: ${this.input.url}`));
        return;
      }
      this.input.onClose?.();
    });

    socket.addEventListener('message', (event) => {
      const raw = typeof event.data === 'string' ? event.data : '';
      if (raw.length === 0) {
        return;
      }
      this.input.captureWireMessage?.({ endpoint: 'client', direction: 'received', raw });
      void this.bridge.receiveMessage(JSON.parse(raw) as Message);
    });
  }

  private flush() {
    while (this.queue.length > 0) {
      const message = this.queue.shift();
      if (message !== undefined) {
        this.send(message);
      }
    }
  }

  private send(message: Message) {
    const raw = JSON.stringify(message);
    this.input.captureWireMessage?.({ endpoint: 'client', direction: 'sent', raw });
    this.socket?.send(raw);
  }

  private openReadyState() {
    return 1;
  }

  private connectTimeoutMs() {
    return this.input.connectTimeoutMs ?? 1500;
  }
}
