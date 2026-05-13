import { describe, expect, test } from 'bun:test';
import { useAgentPriceLineItems } from '../../index';
import { buildRealtimeContext } from '../../testing/realtime-context.builder';
import { priceLineItemRecordInput } from '../../testing/support/test-inputs';
import { backfillModelCall, launchPricedAgent } from './agent-price-line-items-test-env';

describe('feature: realtime agent price line items', () => {
  test('happy: backfill, hooks load current state', async () => {
    const ctx = await buildRealtimeContext({});
    const { agent, modelCall } = await backfillModelCall(ctx);
    const created = await ctx.daemon.backfill(
      'recordAgentPriceLineItem',
      priceLineItemRecordInput(agent.id, modelCall.id),
    );
    const prices = await ctx.realtime.renderHook(() => useAgentPriceLineItems({ agentId: agent.id }));
    const state = await prices.waitFor((value) => value.lineItems.values().length === 1);
    await ctx.close();
    expect(state.lineItems.values()[0]).toMatchObject({ id: created.id, modelCallId: modelCall.id, total: 4.2 });
  });

  test('happy: backfill + realtime, hooks load current state and realtime hook listens to state changes', async () => {
    const ctx = await buildRealtimeContext({});
    const { agent, modelCall } = await backfillModelCall(ctx);
    await ctx.daemon.backfill('recordAgentPriceLineItem', priceLineItemRecordInput(agent.id, modelCall.id));
    const prices = await ctx.realtime.renderHook(() => useAgentPriceLineItems({ agentId: agent.id }));
    await ctx.daemon.do('recordAgentPriceLineItem', priceLineItemRecordInput(agent.id, modelCall.id));
    const state = await prices.waitFor((value) => value.lineItems.values().length === 2);
    await ctx.close();
    expect(state.lineItems.values().map((lineItem) => lineItem.total)).toEqual([4.2, 4.2]);
  });

  test('happy: realtime, hook listens to state changes', async () => {
    const ctx = await buildRealtimeContext({});
    const { agent, modelCall } = await backfillModelCall(ctx);
    const prices = await ctx.realtime.renderHook(() => useAgentPriceLineItems({ agentId: agent.id }));
    const created = await ctx.daemon.do('recordAgentPriceLineItem', priceLineItemRecordInput(agent.id, modelCall.id));
    const state = await prices.waitFor((value) => value.lineItems.values().length === 1);
    await ctx.close();
    expect(state.lineItems.values()[0]).toMatchObject({ id: created.id, modelCallId: modelCall.id });
  });

  test('happy: realtime, launch agent records price line items', async () => {
    const ctx = await buildRealtimeContext({});
    const prices = await ctx.realtime.renderHook(() => useAgentPriceLineItems({ agentId: '' }));
    await launchPricedAgent(ctx);
    const state = await prices.waitFor((value) => value.lineItems.values().length > 0);
    await ctx.close();
    expect(state.lineItems.values()[0]?.agentId).toBeTruthy();
  });

  test('happy: backfill empty, hooks load empty state', async () => {
    const ctx = await buildRealtimeContext({});
    const { agent } = await backfillModelCall(ctx);
    const prices = await ctx.realtime.renderHook(() => useAgentPriceLineItems({ agentId: agent.id }));
    const state = await prices.waitFor((value) => value.agents.getItem(agent.id)?.status === 'ready');
    await ctx.close();
    expect(state.lineItems.entries()).toEqual([]);
  });
});
