import type { SubAgentLifecycleEvent, SubAgentUsageEvent } from '@two-pebble/pebble';
import { Cell, FrameworkAgent, staticPriceCalculator } from '@two-pebble/pebble';
import { persistAgentMetadata } from './agent-registry-status';
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

/**
 * Framework agents (Claude Code today) emit `subAgent*` events when the
 * framework spawns its own internal sub-agents. Historically the daemon
 * created a full agent record for each one — separate row in the agents
 * table, separate trace stream, separate price attribution.
 *
 * We treat those framework subagents as in-flight tool calls instead:
 * - `subAgentStart` becomes a `tool-call-start` trace on the parent.
 * - `subAgentStop` becomes `tool-call-success` or `tool-call-failure`.
 * - `subAgentTrace` is dropped — the parent's own trace stream already
 *   carries the relevant model/assistant activity; subagent-internal
 *   traces would add noise without distinct identity.
 * - `subAgentUsage` is still priced, but the line items are attributed
 *   to the parent so cost-per-agent reports stay correct.
 *
 * The listener is only attached to framework agents; Pebble sub-agents
 * keep their existing path through `recordAgentTrace` →
 * `ensureSubAgent`, because those are user-configured first-class
 * agents.
 */
export function installSubAgentListeners(install: AgentListenerInstallInput): void {
  const { context, input, nextOrderId } = install;
  if (!(input.agent instanceof FrameworkAgent)) {
    return;
  }
  const { agent, agentId, bridge, workspaceId } = input;
  const inferenceProfileId = input.inferenceProfileId;
  const integrationId = input.integrationId;

  agent.on('subAgentStart', (event) => {
    context
      .recordTrace({
        agentId,
        bridge,
        orderId: nextOrderId(),
        trace: buildSubAgentToolStartTrace(event),
        workspaceId,
      })
      .catch((error) => {
        context.logger.warn('daemon framework sub-agent start trace write failed', { agentId, error });
      });
  });
  agent.on('subAgentStop', (event) => {
    context
      .recordTrace({
        agentId,
        bridge,
        orderId: nextOrderId(),
        trace: buildSubAgentToolStopTrace(event),
        workspaceId,
      })
      .catch((error) => {
        context.logger.warn('daemon framework sub-agent stop trace write failed', { agentId, error });
      });
  });
  agent.on('subAgentUsage', (event) => {
    void attributeSubAgentUsage({
      agentId,
      bridge,
      event,
      inferenceProfileId,
      integrationId,
      recordPriceLineItem: context.recordPriceLineItem,
    }).catch((error) => {
      context.logger.warn('daemon framework sub-agent usage attribution failed', { agentId, error });
    });
  });
}

function subAgentToolId(event: { agentTemplateId?: string }): string {
  return `subagent:${event.agentTemplateId ?? 'default'}`;
}

function buildSubAgentToolStartTrace(event: SubAgentLifecycleEvent) {
  return {
    type: 'tool-call-start' as const,
    data: {
      callId: event.agentInstanceId,
      input: { agentTemplateId: event.agentTemplateId ?? null },
      source: 'framework' as const,
      toolId: subAgentToolId(event),
    },
  };
}

function buildSubAgentToolStopTrace(event: SubAgentLifecycleEvent) {
  if (event.status === 'error') {
    return {
      type: 'tool-call-failure' as const,
      data: {
        error: 'Framework sub-agent failed.',
        result: [Cell.text('Framework sub-agent failed.')],
        toolCallId: event.agentInstanceId,
      },
    };
  }
  return {
    type: 'tool-call-success' as const,
    data: {
      result: [Cell.text(`Framework sub-agent ${subAgentToolId(event)} finished.`)],
      toolCallId: event.agentInstanceId,
    },
  };
}

interface AttributeSubAgentUsageInput {
  agentId: string;
  bridge: AgentListenerInstallInput['input']['bridge'];
  event: SubAgentUsageEvent;
  inferenceProfileId: string | undefined;
  integrationId: string | undefined;
  recordPriceLineItem: AgentListenerInstallInput['context']['recordPriceLineItem'];
}

async function attributeSubAgentUsage(input: AttributeSubAgentUsageInput): Promise<void> {
  const report = staticPriceCalculator.calculate(
    `${input.event.usage.provider}/${input.event.usage.modelId}`,
    input.event.usage.usage,
  );
  for (const lineItem of report.lineItems) {
    await input.recordPriceLineItem({
      agentId: input.agentId,
      bridge: input.bridge,
      lineItem,
      ...(input.inferenceProfileId === undefined ? {} : { inferenceProfileId: input.inferenceProfileId }),
      ...(input.integrationId === undefined ? {} : { integrationId: input.integrationId }),
    });
  }
}
