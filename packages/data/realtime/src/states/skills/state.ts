import { LoadableRegistry } from '../../loadable';
import type { SkillRecord, SkillsState } from './types';

export function createSkillsState(): SkillsState {
  return {
    skills: new LoadableRegistry<SkillRecord>(),
  };
}
