import type { Datastore } from '@two-pebble/datastore';
import { staticPriceCalculator } from '@two-pebble/pebble';
import type {
  EnsureSubAgentInput,
  RecordSubAgentTraceInput,
  RecordSubAgentUsageInput,
  StopSubAgentInput,
} from './agent-registry-types';
import { createSubAgent, readSubAgent } from './sub-agent-record';

export type SubAgentCreatePromiseMap = Map<string, SubAgentCreatePromise>;

interface SubAgentCreatePromise {
  parentAgentId: string;
  promise: Promise<string>;
}

interface EnsureContext {
  datastore: Datastore;
  pending: SubAgentCreatePromiseMap;
}

/**
 * Resolves a sub-agent's durable id, creating the record on first sight.
 * Concurrent creates for the same instance id are coalesced through the
 * provided promise map so the daemon never races itself into duplicate rows.
 */
export async function ensureSubAgent(ctx: EnsureContext, input: EnsureSubAgentInput): Promise<string> {
  const id = input.event.agentInstanceId;
  if (id.trim().length === 0) {
    throw new Error('Sub-agent instance id must not be empty.');
  }
  const pending = ctx.pending.get(id);
  if (pending !== undefined) {
    if (pending.parentAgentId !== input.parentAgentId) {
      throw new Error(`Sub-agent instance id ${id} already belongs to another parent agent.`);
    }
    return pending.promise;
  }
  const promise = ensureSubAgentRecord(ctx, input, id);
  ctx.pending.set(id, { parentAgentId: input.parentAgentId, promise });
  try {
    return await promise;
  } finally {
    if (ctx.pending.get(id)?.promise === promise) {
      ctx.pending.delete(id);
    }
  }
}

async function ensureSubAgentRecord(ctx: EnsureContext, input: EnsureSubAgentInput, id: string): Promise<string> {
  const existing = await readSubAgent(ctx.datastore, id);
  if (existing !== undefined) {
    if (existing.parentAgentId !== input.parentAgentId) {
      throw new Error(`Sub-agent instance id ${id} already belongs to another parent agent.`);
    }
    return existing.id;
  }
  const templateId = input.event.agentTemplateId;
  const result = await createSubAgent(ctx.datastore, {
    id,
    description: `Sub-agent ${input.event.agentInstanceId} spawned by ${input.parentAgentId}`,
    name: templateId === undefined ? 'Sub-agent' : `Sub-agent: ${templateId}`,
    parentAgentId: input.parentAgentId,
    workspaceId: input.workspaceId,
  });
  // Only emit `agentRecorded` for newly persisted rows. Reusing an existing
  // record (because the framework re-emits sub-agent-invoke traces or the
  // daemon lost the pending-map entry across rehydrate) would otherwise
  // cause downstream subscribers to treat the same agent as freshly created.
  if (result.created) {
    input.bridge.emit('agentRecorded', result.record);
  }
  return result.id;
}

export async function recordSubAgentTrace(ctx: EnsureContext, input: RecordSubAgentTraceInput): Promise<void> {
  const agentId = await ensureSubAgent(ctx, input);
  const record = await ctx.datastore.agent.traces.record({
    ...input.event.trace,
    agentId,
    id: crypto.randomUUID(),
    orderId: input.orderId,
  });
  input.bridge.emit('agentTraceRecorded', record);
}

export async function recordSubAgentUsage(ctx: EnsureContext, input: RecordSubAgentUsageInput): Promise<void> {
  const agentId = await ensureSubAgent(ctx, input);
  const report = staticPriceCalculator.calculate(`${input.usage.provider}/${input.usage.modelId}`, input.usage.usage);
  for (const lineItem of report.lineItems) {
    const record = await ctx.datastore.agent.priceLineItems.record({
      agentId,
      modelCallId: null,
      inferenceProfileId: null,
      integrationId: null,
      provider: lineItem.provider,
      modelId: lineItem.modelId,
      modelVariantId: lineItem.modelVariantId ?? null,
      charge: lineItem.charge,
      price: lineItem.price,
      quantity: lineItem.quantity,
      timestamp: lineItem.timestamp,
      total: lineItem.total,
    });
    input.bridge.emit('agentPriceLineItemRecorded', record);
  }
}

export async function stopSubAgent(ctx: EnsureContext, input: StopSubAgentInput): Promise<void> {
  const agentId = await ensureSubAgent(ctx, input);
  const record =
    input.event.status === 'error'
      ? await ctx.datastore.agent.fail({ id: agentId })
      : await ctx.datastore.agent.complete({ id: agentId });
  input.bridge.emit('agentRecorded', record);
}
