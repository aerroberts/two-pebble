import { persistAgentMetadata } from './agent-registry-status';
import { ensureSubAgent, recordSubAgentTrace, recordSubAgentUsage, stopSubAgent } from './agent-registry-sub-agents';
import type { AgentListenerInstallInput } from './agent-registry-types';

export function installAgentPersistenceListeners(install: AgentListenerInstallInput): void {
  const { context, input, nextOrderId } = install;
  input.agent.on('status', ({ status }) => {
    void context.persistAgentStatus({ agentId: input.agentId, bridge: input.bridge, status });
  });
  input.agent.on('metadata', (metadata) => {
    void persistAgentMetadata({
      agentId: input.agentId,
      bridge: input.bridge,
      datastore: context.datastore,
      logger: context.logger,
      metadata,
    });
  });
  input.agent.on('trace', (trace) => {
    context
      .recordTrace({
        agentId: input.agentId,
        bridge: input.bridge,
        orderId: nextOrderId(),
        trace,
        workspaceId: input.workspaceId,
      })
      .catch((error) => {
        context.logger.warn('daemon agent trace write failed', { agentId: input.agentId, error });
      });
  });
  const inferenceProfileId = input.inferenceProfileId;
  const integrationId = input.integrationId;
  input.agent.on('modelCall', (call) => {
    context
      .recordModelCall({
        agentId: input.agentId,
        bridge: input.bridge,
        call,
        ...(inferenceProfileId === undefined ? {} : { inferenceProfileId }),
        ...(integrationId === undefined ? {} : { integrationId }),
      })
      .catch((error) => {
        context.logger.warn('daemon agent model call write failed', { agentId: input.agentId, error });
      });
  });
  input.agent.on('threadMessage', (cell) => {
    context.recordConversationCell({ agentId: input.agentId, cell }).catch((error) => {
      context.logger.warn('daemon agent conversation cell write failed', { agentId: input.agentId, error });
    });
  });
  input.agent.on('lineItem', (lineItem) => {
    context
      .recordPriceLineItem({
        agentId: input.agentId,
        bridge: input.bridge,
        lineItem,
        ...(inferenceProfileId === undefined ? {} : { inferenceProfileId }),
        ...(integrationId === undefined ? {} : { integrationId }),
      })
      .catch((error) => {
        context.logger.warn('daemon agent price line item write failed', { agentId: input.agentId, error });
      });
  });
}

export function installSubAgentListeners(install: AgentListenerInstallInput): void {
  const { context, input, nextOrderId } = install;
  const ctx = { datastore: context.datastore, pending: context.pending };
  const { agent, agentId, bridge, workspaceId } = input;
  const warn = (message: string, error: Error) => context.logger.warn(message, { agentId, error });
  agent.on('subAgentStart', (event) => {
    ensureSubAgent(ctx, { bridge, event, parentAgentId: agentId, workspaceId }).catch((error) =>
      warn('daemon sub-agent create failed', error),
    );
  });
  agent.on('subAgentTrace', (event) => {
    recordSubAgentTrace(ctx, { bridge, event, orderId: nextOrderId(), parentAgentId: agentId, workspaceId }).catch(
      (error) => warn('daemon sub-agent trace write failed', error),
    );
  });
  agent.on('subAgentUsage', (event) => {
    recordSubAgentUsage(ctx, { bridge, event, parentAgentId: agentId, usage: event.usage, workspaceId }).catch(
      (error) => warn('daemon sub-agent usage write failed', error),
    );
  });
  agent.on('subAgentStop', (event) => {
    stopSubAgent(ctx, { bridge, event, parentAgentId: agentId, workspaceId }).catch((error) =>
      warn('daemon sub-agent stop failed', error),
    );
  });
}
