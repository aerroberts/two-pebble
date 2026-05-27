import type { ClientProtocol } from '@two-pebble/protocol';
import type { Bridge, ProtocolOpByName, ProtocolOutboundOps, WsBridgeClient } from '@two-pebble/ws-bridge';
import type { ReactNode } from 'react';
import type { StoreApi } from 'zustand/vanilla';
import type { RealtimeDatastore } from './realtime-datastore';

export interface RealtimeDaemonConnectionProps {
  children: ReactNode;
  loading?: ReactNode;
  notConnected?: ReactNode;
  onOperationError?: (error: RealtimeOperationError) => void;
  url: string;
}

export type RealtimeConnectionStatus = 'connecting' | 'connected' | 'not-connected';

export interface RealtimeConnectionState {
  error: Error;
  status: RealtimeConnectionStatus;
}

export type RealtimeConnectionContextValue = RealtimeConnectionState;

export interface RealtimeDatastoreInput {
  url: string;
}

export interface RealtimeOperationError {
  error: Error;
  operation: string;
}

export type RealtimeClosedHandler = () => void;
export type RealtimeClosedHandlerOrNull = RealtimeClosedHandler | null;
export type RealtimeOperationErrorHandler = (error: RealtimeOperationError) => void;
export type RealtimeOperationErrorHandlerOrNull = RealtimeOperationErrorHandler | null;
export type RealtimeStateStore<TState extends object> = StoreApi<TState>;
export type RealtimeClient = WsBridgeClient<ClientProtocol> | null;
export type RealtimeBridge = Bridge<ClientProtocol>;
export type RealtimeSelector<TState extends object, TValue> = (state: TState) => TValue;
export type RealtimeDatastoreContextValue = RealtimeDatastore | null;
export type RealtimeEmitName = ProtocolOutboundOps<ClientProtocol>[number]['name'];
export type RealtimeEmitPayload<TName extends RealtimeEmitName> = ProtocolOpByName<
  ProtocolOutboundOps<ClientProtocol>,
  TName
>['request'];
export type RealtimeEmitResponse<TName extends RealtimeEmitName> = ProtocolOpByName<
  ProtocolOutboundOps<ClientProtocol>,
  TName
>['response'];

export interface RealtimeOperationContext {
  datastore: RealtimeDatastore;
}

export interface RealtimeEmitOptions<TName extends RealtimeEmitName> {
  after?: (payload: RealtimeEmitPayload<TName>, response: Awaited<RealtimeEmitResponse<TName>>) => void;
  before?: (payload: RealtimeEmitPayload<TName>) => void;
  error?: (payload: RealtimeEmitPayload<TName>, error: Error) => void;
}
