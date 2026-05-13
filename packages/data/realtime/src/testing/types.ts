import type { TwoPebbleDaemon } from '@two-pebble/daemon';
import type { ClientProtocol } from '@two-pebble/protocol';
import type { ProtocolOpByName, ProtocolOutboundOps, WsBridgeClient } from '@two-pebble/ws-bridge';
import type { ReactNode } from 'react';
import type { Root } from 'react-dom/client';
import type { RealtimeDatastore } from '../realtime-datastore';
import type { RealtimeDaemonDriver } from './realtime-daemon-driver';
import type { RealtimeHookDriver } from './realtime-hook-driver';
import type { RealtimeRenderedHookValue } from './realtime-rendered-hook-value';

export type RealtimeOperationName = ProtocolOutboundOps<ClientProtocol>[number]['name'];

export type RealtimeOperationPayload<TName extends RealtimeOperationName> = ProtocolOpByName<
  ProtocolOutboundOps<ClientProtocol>,
  TName
>['request'];

export type RealtimeOperationResponse<TName extends RealtimeOperationName> = ProtocolOpByName<
  ProtocolOutboundOps<ClientProtocol>,
  TName
>['response'];

export type RealtimeHook<TValue> = () => TValue;
export type RealtimeWaitPredicate<TValue> = (value: TValue) => boolean;
export type AttachedRealtimeDatastore = RealtimeDatastore;
export type ConsoleArguments = string[];
export type DirectDaemonClient = WsBridgeClient<ClientProtocol>;
export type MaybeRealtimeDatastore = RealtimeDatastore | null;

export interface RealtimeContext {
  close(): Promise<void>;
  daemon: RealtimeDaemonDriver;
  realtime: RealtimeHookDriver;
}

export interface RealtimeHookDriverInput {
  daemon: RealtimeDaemonDriver;
  url: string;
}

export interface RealtimeDaemonDriverInput {
  url: string;
}

export interface RealtimeRenderedHook<TValue> {
  close(): void;
  current(): TValue;
  waitFor(predicate: RealtimeWaitPredicate<TValue>): Promise<TValue>;
  waitForItemCount(count: number): Promise<TValue>;
  waitForStatus(status: string): Promise<TValue>;
}

export interface RealtimeContextBuilderInput {
  logFileName?: string;
}

export interface RealtimeRenderedHookValueInput<TValue> {
  root: Root;
  value: () => TValue;
}

export interface RealtimeTestContextInput {
  daemon: RealtimeDaemonDriver;
  daemonInstance: TwoPebbleDaemon;
  directoryPath: string;
  realtime: RealtimeHookDriver;
}

export interface HookProbeInput<TValue> {
  hook: RealtimeHook<TValue>;
  onDatastore: (datastore: RealtimeDatastore) => void;
  onValue: (value: TValue) => void;
}

export interface RealtimeConnectionWrapperInput {
  children: ReactNode;
  url: string;
}

export type RealtimeRenderedHookInstance<TValue> = RealtimeRenderedHookValue<TValue>;
