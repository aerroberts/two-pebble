import type { RealtimeEmitPayload, RealtimeEmitResponse, RealtimeOperationContext } from '../types';

type TranscribeAudioPayload = RealtimeEmitPayload<'transcribeAudio'>;
type TranscribeAudioResponse = RealtimeEmitResponse<'transcribeAudio'>;

export function transcribeAudioOperation(ctx: RealtimeOperationContext) {
  return async function transcribeAudio(payload: TranscribeAudioPayload): Promise<TranscribeAudioResponse> {
    return ctx.datastore.emit('transcribeAudio', payload);
  };
}
