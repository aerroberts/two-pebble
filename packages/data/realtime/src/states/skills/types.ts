import type { LoadableRegistry } from '../../loadable';
import type { RealtimeEmitPayload, RealtimeEmitResponse } from '../../types';

export interface SkillsState {
  skills: LoadableRegistry<SkillRecord>;
}

export type CreateSkillInput = RealtimeEmitPayload<'createSkill'>;
export type CreateSkillResponse = RealtimeEmitResponse<'createSkill'>;
export type ReadSkillInput = RealtimeEmitPayload<'readSkill'>;
export type UpdateSkillInput = RealtimeEmitPayload<'updateSkill'>;
export type DeleteSkillInput = RealtimeEmitPayload<'deleteSkill'>;
export type SkillRecord = RealtimeEmitResponse<'listSkills'>['items'][number];
