import type { SpeechResult } from './types';

export type SpeechScriptStep = SpeechResult | { throw: Error };
