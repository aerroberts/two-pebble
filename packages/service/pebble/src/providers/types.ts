import type { PricingLineItem } from '../pricing';

/**
 * Shared shape for every provider call result (chat / transcription / speech).
 * Concrete result types extend this with their modality-specific payload.
 */
export interface ProviderCallResultBase {
  id: string;
  startedAt: number;
  completedAt: number;
  modelId: string;
  provider: string;
  status: 'success' | 'error';
  error?: string;
  retryable?: boolean;
  prices: PricingLineItem[];
  providerInput: object;
  providerOutput: object;
}

type ProviderOutputBlockThinking = {
  type: 'thinking';
  text: string;
};

type ProviderOutputBlockText = {
  type: 'text';
  text: string;
};

type ProviderOutputBlockImage = {
  type: 'image';
  base64Image: string;
};

type ProviderOutputBlockTool = {
  type: 'tool';
  callid: string;
  toolid: string;
  payload: object;
};

export type ProviderOutputBlock =
  | ProviderOutputBlockThinking
  | ProviderOutputBlockText
  | ProviderOutputBlockImage
  | ProviderOutputBlockTool;

/** Result of a chat / intelligence model call. */
export interface ProviderResult extends ProviderCallResultBase {
  threadCellPointer: string;
  output: ProviderOutputBlock[];
}

/** Input for a text-to-speech synthesize call. */
export interface SpeechInput {
  text: string;
  voice: string;
  format?: string;
}

/** Result of a text-to-speech synthesize call. */
export interface SpeechResult extends ProviderCallResultBase {
  base64Data: string;
  mimeType: string;
  durationMs?: number;
}

/** Input for a speech-to-text transcribe call. */
export interface TranscriptionInput {
  base64Data: string;
  mimeType: string;
}

/** Result of a speech-to-text transcribe call. */
export interface TranscriptionResult extends ProviderCallResultBase {
  text: string;
  language?: string;
  durationMs?: number;
}
