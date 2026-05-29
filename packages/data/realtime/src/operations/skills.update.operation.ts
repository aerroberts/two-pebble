import type { UpdateSkillInput } from '../states/skills/types';
import type { RealtimeOperationContext } from '../types';

export function updateSkillOperation(ctx: RealtimeOperationContext) {
  return async function updateSkill(payload: UpdateSkillInput) {
    const skill = await ctx.datastore.emit('updateSkill', payload);
    ctx.datastore.patch({
      skills: ctx.datastore.state.skills.withItem(skill.id, skill, 'ready'),
    });
    return skill;
  };
}
