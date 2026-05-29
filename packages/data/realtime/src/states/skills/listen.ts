import type { RealtimeOperationContext } from '../../types';

export function listenToSkills(ctx: RealtimeOperationContext) {
  const client = ctx.datastore.client;
  if (client === null) {
    return;
  }

  client.listen('skillDeleted', (deleted) => {
    ctx.datastore.patch({ skills: ctx.datastore.state.skills.withoutItem(deleted.id) });
  });
  client.listen('skillUpdated', (skill) => {
    ctx.datastore.patch({
      skills: ctx.datastore.state.skills.withItem(skill.id, skill, 'ready'),
    });
  });
}
