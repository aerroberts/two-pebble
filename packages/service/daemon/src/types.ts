import type { Datastore } from '@two-pebble/datastore';
import type { Logger } from '@two-pebble/logger';
import type { AgentLivenessEvent, DaemonProtocol } from '@two-pebble/protocol';
import type {
  Bridge,
  ProtocolEventByName,
  ProtocolInboundOps,
  ProtocolOpByName,
  ProtocolOutboundEvents,
  WsBridgeServer,
} from '@two-pebble/ws-bridge';
import type { AgentRegistryService } from './services/agent-registry-service';
import type { AutomationService } from './services/automation-service';
import type { HeartbeatService } from './services/heartbeat-service';
import type { LivenessReconciler } from './services/liveness-reconciler';
import type { TaskBoardService } from './services/task-board-service';

export type DaemonBridge = Bridge<DaemonProtocol>;

export type DaemonServer = WsBridgeServer<DaemonProtocol>;

export type DaemonOperationName = ProtocolInboundOps<DaemonProtocol>[number]['name'];

export type DaemonOutboundEventName = ProtocolOutboundEvents<DaemonProtocol>[number]['name'];

export type DaemonOutboundPayload<TName extends DaemonOutboundEventName> = ProtocolEventByName<
  ProtocolOutboundEvents<DaemonProtocol>,
  TName
>['payload'];

export type DaemonFetchResponse = Response | undefined;

export type AgentLivenessPayload = AgentLivenessEvent['payload'];

export type DaemonOperationHandler<TName extends DaemonOperationName> = (
  payload: ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, TName>['request'],
) => Promise<ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, TName>['response']>;

export interface TwoPebbleDaemonInput {
  databaseFilePath?: string;
  databaseFilePathForPort?: (port: number) => string;
  host: string;
  logFilePath: string;
  port: number;
  portRange?: number;
}

export interface DaemonRuntimeContext {
  agentRegistry: AgentRegistryService;
  automations: AutomationService;
  databaseFilePath: string;
  datastore: Datastore;
  heartbeat: HeartbeatService;
  logger: Logger;
  logsDirectoryPath: string;
  multicastBridge: DaemonBridge;
  port: number;
  taskBoards: TaskBoardService;
  livenessReconciler?: LivenessReconciler;
}

/**
 * Context handed to daemon handlers. Intentionally drops the per-client
 * `bridge` field so a handler cannot accidentally broadcast a state
 * change to only the caller — every connected UI must see every
 * mutation. Handlers that need to fan out events go through
 * `multicastBridge`. The per-client bridge stays in the daemon's
 * operation wrapper, which is the only place a per-client emission
 * (e.g. debug log notifications) is allowed.
 */
export type DaemonHandlerContext = DaemonRuntimeContext;

export interface AgentRegistryServiceContext {
  datastore: Datastore;
  logger: Logger;
  multicastBridge: DaemonBridge;
  taskBoards: TaskBoardService;
}

export interface CreateWorktreeContext {
  multicastBridge: DaemonBridge;
  datastore: Datastore;
  logger: Logger;
}
