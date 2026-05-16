import type { Guardrail } from '../constructs/guardrail';
import type { GuardrailContext, RuleConfig } from '../types';

export interface RuleRegistration {
  name: string;
  create: (context: GuardrailContext<RuleConfig>) => Guardrail;
}

export interface MergeableRuleConfig extends RuleConfig {
  find?: object[];
  rules?: object[];
}
