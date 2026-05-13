import { bridgeOperationError } from '../errors';
import type {
  BridgeEventHandler,
  BridgeOperationHandler,
  BridgeProtocol,
  BridgeResolveHandler,
  Message,
  MessageEvent,
  MessageOperationRequest,
  MessageOperationResponse,
  ProtocolEventByName,
  ProtocolInboundEvents,
  ProtocolInboundOps,
  ProtocolOpByName,
  ProtocolOutboundEvents,
  ProtocolOutboundOps,
} from '../protocol';

/**
 * Transport-agnostic in-process bridge for typed operations and events.
 *
 * Wire it to a transport by calling `onSendMessage` (to transmit outgoing
 * messages) and piping received messages into `receiveMessage`. The bridge
 * handles operation request/response matching and event fan-out internally.
 */
export class Bridge<Protocol extends BridgeProtocol> {
  private send: ((msg: Message) => void) | null = null;

  private readonly operationHandlers = new Map<string, BridgeOperationHandler>();

  private readonly resolveListeners = new Map<string, BridgeResolveHandler>();
  private readonly rejectListeners = new Map<string, (error: Error) => void>();

  private readonly eventListeners = new Map<string, Set<BridgeEventHandler>>();

  /**
   * Registers the transport sender for outbound bridge messages.
   * The caller provides the concrete wire implementation.
   * The bridge calls it whenever operations or events are emitted.
   */
  public onSendMessage(send: (msg: Message) => void): void {
    this.send = send;
  }

  private dispatch(msg: Message): void {
    this.send?.(msg);
  }

  /**
   * Register a handler for an inbound operation. The other side calls this
   * operation via `.do()` and receives the resolved value as the response.
   * Any thrown error is surfaced to the caller as an error response.
   */
  public on<TName extends ProtocolInboundOps<Protocol>[number]['name']>(
    operation: TName,
    handler: (
      payload: ProtocolOpByName<ProtocolInboundOps<Protocol>, TName>['request'],
    ) => Promise<ProtocolOpByName<ProtocolInboundOps<Protocol>, TName>['response']>,
  ): void {
    this.operationHandlers.set(operation, handler as BridgeOperationHandler);
  }

  /**
   * Call an outbound operation on the other side and await the typed response.
   * Rejects if the other side returns an error or the handler throws.
   */
  public async do<TName extends ProtocolOutboundOps<Protocol>[number]['name']>(
    operation: TName,
    payload: ProtocolOpByName<ProtocolOutboundOps<Protocol>, TName>['request'],
  ): Promise<ProtocolOpByName<ProtocolOutboundOps<Protocol>, TName>['response']> {
    const id = crypto.randomUUID();
    return new Promise((resolve, reject) => {
      this.resolveListeners.set(id, resolve as BridgeResolveHandler);
      this.rejectListeners.set(id, reject);
      this.dispatch({ id, type: 'operationRequest', operation, payload });
    });
  }

  /**
   * Subscribe to an inbound event emitted by the other side. Returns an
   * unlisten function — call it to stop receiving the event.
   */
  public listen<TName extends ProtocolInboundEvents<Protocol>[number]['name']>(
    event: TName,
    handler: (payload: ProtocolEventByName<ProtocolInboundEvents<Protocol>, TName>['payload']) => void,
  ): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }

    const wrappedHandler = handler as BridgeEventHandler;
    this.eventListeners.get(event)?.add(wrappedHandler);

    return () => {
      this.eventListeners.get(event)?.delete(wrappedHandler);
    };
  }

  /**
   * Emit an outbound event to the other side. If no listener is registered
   * the event is a no-op for that side.
   */
  public emit<TName extends ProtocolOutboundEvents<Protocol>[number]['name']>(
    event: TName,
    payload: ProtocolEventByName<ProtocolOutboundEvents<Protocol>, TName>['payload'],
  ): void {
    this.dispatch({ id: crypto.randomUUID(), type: 'event', event, payload });
  }

  /**
   * Accepts a message received from the transport layer.
   * The bridge routes requests, responses, and events by message type.
   * The promise resolves once any matching operation handler has finished.
   */
  public async receiveMessage(msg: Message): Promise<void> {
    switch (msg.type) {
      case 'operationRequest':
        await this.handleOperationRequest(msg);
        return;
      case 'operationResponse':
        this.handleOperationResponse(msg);
        return;
      case 'event':
        this.handleEvent(msg);
        return;
    }
  }

  private async handleOperationRequest(msg: MessageOperationRequest): Promise<void> {
    const handler = this.operationHandlers.get(msg.operation);

    if (!handler) {
      this.dispatch({
        id: msg.id,
        type: 'operationResponse',
        status: 'error',
        error: `No handler registered for operation: ${msg.operation}`,
      });
      return;
    }

    try {
      const response = await handler(msg.payload);
      this.dispatch({ id: msg.id, type: 'operationResponse', status: 'success', payload: response });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.dispatch({ id: msg.id, type: 'operationResponse', status: 'error', error: message });
    }
  }

  private handleOperationResponse(msg: MessageOperationResponse): void {
    const resolve = this.resolveListeners.get(msg.id);
    const reject = this.rejectListeners.get(msg.id);

    this.resolveListeners.delete(msg.id);
    this.rejectListeners.delete(msg.id);

    if (msg.status === 'error') {
      reject?.(bridgeOperationError(msg.error ?? 'Operation failed'));
    } else {
      resolve?.(msg.payload);
    }
  }

  private handleEvent(msg: MessageEvent): void {
    const handlers = this.eventListeners.get(msg.event);
    if (!handlers) return;
    for (const handler of handlers) {
      handler(msg.payload);
    }
  }
}
