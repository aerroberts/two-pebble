import type { ProviderResult } from '../types';

export type ScriptStep = ProviderResult | { throw: Error };
