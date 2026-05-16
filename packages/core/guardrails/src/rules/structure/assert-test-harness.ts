import { Controller } from '../../runner/controller';
import type { StructureFindRuleConfig } from './types';

export async function runStructureAssertion(root: string, rule: StructureFindRuleConfig) {
  return new Controller().run(root, {
    additional: {
      '@rule/structure': {
        find: [rule],
      },
    },
  });
}
