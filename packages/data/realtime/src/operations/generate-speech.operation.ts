import type { RealtimeEmitPayload, RealtimeEmitResponse, RealtimeOperationContext } from '../types';

type GenerateSpeechPayload = RealtimeEmitPayload<'generateSpeech'>;
type GenerateSpeechResponse = RealtimeEmitResponse<'generateSpeech'>;

export function generateSpeechOperation(ctx: RealtimeOperationContext) {
  return async function generateSpeech(payload: GenerateSpeechPayload): Promise<GenerateSpeechResponse> {
    return ctx.datastore.emit('generateSpeech', payload);
  };
}
