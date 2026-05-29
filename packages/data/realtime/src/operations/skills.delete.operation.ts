import type { DeleteSkillInput } from '../states/skills/types';
import type { RealtimeOperationContext } from '../types';

export function deleteSkillOperation(ctx: RealtimeOperationContext) {
  return async function deleteSkill(payload: DeleteSkillInput) {
    const existing = ctx.datastore.state.skills.getItem(payload.id)?.value;
    if (existing !== undefined && existing !== null) {
      ctx.datastore.patch({
        skills: ctx.datastore.state.skills.withItem(payload.id, existing, 'loading'),
      });
    }

    try {
      const deleted = await ctx.datastore.emit('deleteSkill', payload);
      ctx.datastore.patch({ skills: ctx.datastore.state.skills.withoutItem(payload.id) });
      return deleted;
    } catch (error) {
      if (existing !== undefined && existing !== null) {
        ctx.datastore.patch({
          skills: ctx.datastore.state.skills.withItem(payload.id, existing, 'ready'),
        });
      }
      throw error;
    }
  };
}
