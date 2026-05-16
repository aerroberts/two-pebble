import type { GuardrailConfig } from '../types';
import { Controller } from './controller';

export function configValidatorTestEnv() {
  return {
    async run(config: GuardrailConfig) {
      return new Controller().run(process.cwd(), config);
    },
  };
}
