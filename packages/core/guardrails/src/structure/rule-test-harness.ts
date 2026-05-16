import { Controller } from '../runner/controller';
import type { StructureFindRuleConfig } from '../types';

export async function runStructureRule(root: string, rule: StructureFindRuleConfig) {
  return new Controller().run(root, {
    rules: [rule],
  });
}
