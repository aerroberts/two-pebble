import { describe, expect, test } from 'bun:test';
import { useKnownIdes } from '../../index';
import { buildRealtimeContext } from '../../testing/realtime-context.builder';

describe('feature: realtime known IDEs', () => {
  test('happy: backfill, hooks load current state', async () => {
    const ctx = await buildRealtimeContext({});
    const created = await ctx.daemon.backfill('createKnownIde', {
      kind: 'vscode',
      displayName: 'VS Code',
      executablePath: process.execPath,
    });
    const knownIdes = await ctx.realtime.renderHook(useKnownIdes);
    const state = await knownIdes.waitForItemCount(1);
    await ctx.close();
    expect(state.getItem(created.id)?.value?.displayName).toBe('VS Code');
  });

  test('happy: realtime hook listens to create and delete events', async () => {
    const ctx = await buildRealtimeContext({});
    const knownIdes = await ctx.realtime.renderHook(useKnownIdes);
    const created = await ctx.daemon.do('createKnownIde', {
      kind: 'other',
      displayName: 'Node',
      executablePath: process.execPath,
    });
    await knownIdes.waitForItemCount(1);
    await ctx.daemon.do('deleteKnownIde', { id: created.id });
    const state = await knownIdes.waitForItemCount(0);
    await ctx.close();
    expect(state.values()).toEqual([]);
  });
});
