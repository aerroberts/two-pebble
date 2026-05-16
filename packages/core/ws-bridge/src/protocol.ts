import type { Bridge } from './bridge/bridge';

/**
 * JSON-compatible payload shape accepted by bridge messages.
 */
export type BridgePayload = BridgePayload[] | object | boolean | number | string | null | undefined;

/**
 * Object payload map whose values stay within bridge-safe payload types.
 */
export interface BridgePayloadObject {
  [key: string]: BridgePayload;
}

/**
 * Named request/response contract for an operation on one bridge side.
 */
export interface RequestResponseProtocol<
  TName extends string = string,
  TRequest extends BridgePayload = BridgePayload,
  TResponse extends BridgePayload = BridgePayload,
> {
  name: TName;
  request: TRequest;
  response: TResponse;
}

/**
 * Named event contract carrying a one-way payload across the bridge.
 */
export interface EventProtocol<TName extends string = string, TPayload extends BridgePayload = BridgePayload> {
  name: TName;
  payload: TPayload;
}

/**
 * One side of a bridge protocol, split into callable operations and emitted events.
 */
export interface BridgeProtocolOneDirectional<
  TOperations extends RequestResponseProtocol[] = [],
  TEvents extends EventProtocol[] = [],
> {
  operations?: TOperations;
  events?: TEvents;
}

/**
 * Broad one-directional protocol used when callers do not need specific names.
 */
export type AnyBridgeProtocolOneDirectional = BridgeProtocolOneDirectional<RequestResponseProtocol[], EventProtocol[]>;

/**
 * Full bridge protocol describing outbound and inbound capabilities together.
 */
export interface BridgeProtocol<
  TOutbound extends AnyBridgeProtocolOneDirectional = AnyBridgeProtocolOneDirectional,
  TInbound extends AnyBridgeProtocolOneDirectional = AnyBridgeProtocolOneDirectional,
> {
  outbound: TOutbound;
  inbound: TInbound;
}

/**
 * Extracts the outbound operation tuple from a bridge protocol.
 */
export type ProtocolOutboundOps<P extends BridgeProtocol> =
  P['outbound']['operations'] extends RequestResponseProtocol[] ? P['outbound']['operations'] : never[];

/**
 * Extracts the inbound operation tuple from a bridge protocol.
 */
export type ProtocolInboundOps<P extends BridgeProtocol> = P['inbound']['operations'] extends RequestResponseProtocol[]
  ? P['inbound']['operations']
  : never[];

/**
 * Extracts the outbound event tuple from a bridge protocol.
 */
export type ProtocolOutboundEvents<P extends BridgeProtocol> = P['outbound']['events'] extends EventProtocol[]
  ? P['outbound']['events']
  : never[];

/**
 * Extracts the inbound event tuple from a bridge protocol.
 */
export type ProtocolInboundEvents<P extends BridgeProtocol> = P['inbound']['events'] extends EventProtocol[]
  ? P['inbound']['events']
  : never[];

/**
 * Looks up an operation contract by name inside an operation tuple.
 */
export type ProtocolOpByName<TOps extends RequestResponseProtocol[], TName extends string> = Extract<
  TOps[number],
  { name: TName }
>;

/**
 * Looks up an event contract by name inside an event tuple.
 */
export type ProtocolEventByName<TEvents extends EventProtocol[], TName extends string> = Extract<
  TEvents[number],
  { name: TName }
>;

/**
 * Wire message sent when one side invokes a remote operation.
 */
export interface MessageOperationRequest {
  id: string;
  type: 'operationRequest';
  operation: string;
  payload: BridgePayload;
}

/**
 * Wire message sent when a remote operation completes or fails.
 */
export interface MessageOperationResponse {
  id: string;
  type: 'operationResponse';
  status: 'success' | 'error';
  error?: string;
  payload?: BridgePayload;
}

/**
 * Wire message sent for a one-way event emission.
 */
export interface MessageEvent {
  id: string;
  type: 'event';
  event: string;
  payload: BridgePayload;
}

/**
 * Union of all bridge messages that may cross a transport boundary.
 */
export type Message = MessageOperationRequest | MessageOperationResponse | MessageEvent;

/**
 * Runtime handler invoked for a named operation.
 */
export type BridgeOperationHandler = (payload: BridgePayload) => Promise<BridgePayload>;

/**
 * Runtime resolver stored while an operation response is pending.
 */
export type BridgeResolveHandler = (response: BridgePayload) => void;

/**
 * Runtime handler invoked when an event payload is received.
 */
export type BridgeEventHandler = (payload: BridgePayload) => void;

/**
 * Placeholder socket data type used by the Bun websocket server.
 */
export type WsBridgeSocketData = null;

/**
 * Minimal websocket surface needed by the client transport.
 */
export interface WebSocketLike {
  readyState: number;
  send(data: string): void;
  close(): void;
  addEventListener(type: 'message', handler: (event: { data: string | ArrayBuffer | Blob }) => void): void;
  addEventListener(type: 'open' | 'close' | 'error', handler: () => void): void;
}

/**
 * Configuration for connecting a websocket bridge client.
 */
export interface WsBridgeClientInput {
  connectTimeoutMs?: number;
  captureWireMessage?: (message: WsBridgeWireMessage) => void;
  onClose?: () => void;
  url: string;
}

/**
 * Configuration for launching a websocket bridge server.
 */
export interface WsBridgeServerInput {
  captureWireMessage?: (message: WsBridgeWireMessage) => void;
  fetch?: (request: Request) => Response | undefined | Promise<Response | undefined>;
  hostname?: string;
  port: number;
}

/**
 * Callback used to register client-side bridge handlers after connect.
 */
export type WsBridgeClientSetup<Protocol extends BridgeProtocol> = (bridge: Bridge<Protocol>) => void;

/**
 * Callback invoked for each connected server-side bridge client.
 */
export type WsBridgeServerClientHandler<Protocol extends BridgeProtocol> = (bridge: Bridge<Protocol>) => void;

/**
 * Captured raw wire message with endpoint and direction metadata.
 */
export interface WsBridgeWireMessage {
  direction: WsBridgeWireMessageDirection;
  endpoint: WsBridgeWireMessageEndpoint;
  raw: string;
}

/**
 * Direction of a captured bridge wire message relative to its endpoint.
 */
export type WsBridgeWireMessageDirection = 'received' | 'sent';

/**
 * Endpoint that observed a captured bridge wire message.
 */
export type WsBridgeWireMessageEndpoint = 'client' | 'server';
