import type { RealtimeOperationContext } from '../../types';

export function listenToAutomations(ctx: RealtimeOperationContext): void {
  const client = ctx.datastore.client;
  if (client === null) {
    return;
  }

  client.listen('automationUpdated', (automation) => {
    ctx.datastore.patch({
      automations: ctx.datastore.state.automations.withItem(automation.id, automation, 'ready'),
    });
  });
  client.listen('automationDeleted', (deleted) => {
    ctx.datastore.patch({ automations: ctx.datastore.state.automations.withoutItem(deleted.id) });
  });
  client.listen('heartbeatRecorded', (heartbeat) => {
    ctx.datastore.patch({
      heartbeats: ctx.datastore.state.heartbeats.withItem(heartbeat.id, heartbeat, 'ready'),
    });
  });
}
