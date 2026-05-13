import type { Bridge } from './bridge/bridge';

export type BridgePayload = BridgePayload[] | object | boolean | number | string | null | undefined;

export interface BridgePayloadObject {
  [key: string]: BridgePayload;
}

export interface RequestResponseProtocol<
  TName extends string = string,
  TRequest extends BridgePayload = BridgePayload,
  TResponse extends BridgePayload = BridgePayload,
> {
  name: TName;
  request: TRequest;
  response: TResponse;
}

export interface EventProtocol<TName extends string = string, TPayload extends BridgePayload = BridgePayload> {
  name: TName;
  payload: TPayload;
}

export interface BridgeProtocolOneDirectional<
  TOperations extends RequestResponseProtocol[] = [],
  TEvents extends EventProtocol[] = [],
> {
  operations?: TOperations;
  events?: TEvents;
}

export type AnyBridgeProtocolOneDirectional = BridgeProtocolOneDirectional<RequestResponseProtocol[], EventProtocol[]>;

export interface BridgeProtocol<
  TOutbound extends AnyBridgeProtocolOneDirectional = AnyBridgeProtocolOneDirectional,
  TInbound extends AnyBridgeProtocolOneDirectional = AnyBridgeProtocolOneDirectional,
> {
  outbound: TOutbound;
  inbound: TInbound;
}

export type ProtocolOutboundOps<P extends BridgeProtocol> =
  P['outbound']['operations'] extends RequestResponseProtocol[] ? P['outbound']['operations'] : never[];

export type ProtocolInboundOps<P extends BridgeProtocol> = P['inbound']['operations'] extends RequestResponseProtocol[]
  ? P['inbound']['operations']
  : never[];

export type ProtocolOutboundEvents<P extends BridgeProtocol> = P['outbound']['events'] extends EventProtocol[]
  ? P['outbound']['events']
  : never[];

export type ProtocolInboundEvents<P extends BridgeProtocol> = P['inbound']['events'] extends EventProtocol[]
  ? P['inbound']['events']
  : never[];

export type ProtocolOpByName<TOps extends RequestResponseProtocol[], TName extends string> = Extract<
  TOps[number],
  { name: TName }
>;

export type ProtocolEventByName<TEvents extends EventProtocol[], TName extends string> = Extract<
  TEvents[number],
  { name: TName }
>;

export interface MessageOperationRequest {
  id: string;
  type: 'operationRequest';
  operation: string;
  payload: BridgePayload;
}

export interface MessageOperationResponse {
  id: string;
  type: 'operationResponse';
  status: 'success' | 'error';
  error?: string;
  payload?: BridgePayload;
}

export interface MessageEvent {
  id: string;
  type: 'event';
  event: string;
  payload: BridgePayload;
}

export type Message = MessageOperationRequest | MessageOperationResponse | MessageEvent;

export type BridgeOperationHandler = (payload: BridgePayload) => Promise<BridgePayload>;

export type BridgeResolveHandler = (response: BridgePayload) => void;

export type BridgeEventHandler = (payload: BridgePayload) => void;

export type WsBridgeSocketData = null;

export interface WebSocketLike {
  readyState: number;
  send(data: string): void;
  close(): void;
  addEventListener(type: 'message', handler: (event: { data: string | ArrayBuffer | Blob }) => void): void;
  addEventListener(type: 'open' | 'close' | 'error', handler: () => void): void;
}

export interface WsBridgeClientInput {
  connectTimeoutMs?: number;
  captureWireMessage?: (message: WsBridgeWireMessage) => void;
  onClose?: () => void;
  url: string;
}

export interface WsBridgeServerInput {
  captureWireMessage?: (message: WsBridgeWireMessage) => void;
  fetch?: (request: Request) => Response | undefined | Promise<Response | undefined>;
  hostname?: string;
  port: number;
}

export type WsBridgeClientSetup<Protocol extends BridgeProtocol> = (bridge: Bridge<Protocol>) => void;

export type WsBridgeServerClientHandler<Protocol extends BridgeProtocol> = (bridge: Bridge<Protocol>) => void;

export interface WsBridgeWireMessage {
  direction: WsBridgeWireMessageDirection;
  endpoint: WsBridgeWireMessageEndpoint;
  raw: string;
}

export type WsBridgeWireMessageDirection = 'received' | 'sent';

export type WsBridgeWireMessageEndpoint = 'client' | 'server';
