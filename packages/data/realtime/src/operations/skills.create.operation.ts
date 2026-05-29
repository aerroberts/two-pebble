import type { CreateSkillInput, CreateSkillResponse } from '../states/skills/types';
import type { RealtimeOperationContext } from '../types';

export function createSkillOperation(ctx: RealtimeOperationContext) {
  return async function createSkill(payload: CreateSkillInput): Promise<CreateSkillResponse> {
    const skill = await ctx.datastore.emit('createSkill', payload);
    ctx.datastore.patch({
      skills: ctx.datastore.state.skills.withItem(skill.id, skill, 'ready'),
    });
    return skill;
  };
}
