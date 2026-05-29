import type { ReadSkillInput } from '../states/skills/types';
import type { RealtimeOperationContext } from '../types';

export function readSkillOperation(ctx: RealtimeOperationContext) {
  return async function readSkill(payload: ReadSkillInput) {
    const existing = ctx.datastore.state.skills.getItem(payload.id)?.value;
    if (existing !== undefined && existing !== null) {
      ctx.datastore.patch({
        skills: ctx.datastore.state.skills.withItem(payload.id, existing, 'loading'),
      });
    }

    try {
      const skill = await ctx.datastore.emit('readSkill', payload);
      ctx.datastore.patch({
        skills: ctx.datastore.state.skills.withItem(skill.id, skill, 'ready'),
      });
      return skill;
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
