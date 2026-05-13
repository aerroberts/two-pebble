import { ProviderFactory } from '@two-pebble/pebble';
import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import { recordVoiceCall } from '../services/voice-call-recording';
import type { DaemonHandlerContext } from '../types';

type TranscribeAudioOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'transcribeAudio'>;
type TranscribeAudioPayload = TranscribeAudioOperation['request'];
type TranscribeAudioResponse = TranscribeAudioOperation['response'];
type ProviderOutput = object;

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: TranscribeAudioPayload): Promise<TranscribeAudioResponse> {
    const inferenceProfile = await ctx.datastore.inferenceProfiles.read({ id: payload.inferenceProfileId });
    if (inferenceProfile.kind !== 'transcription') {
      throw new Error(`Inference profile is not a transcription profile: ${payload.inferenceProfileId}`);
    }
    const integration = await ctx.datastore.integrations.read({ id: inferenceProfile.integrationId });
    const provider = new ProviderFactory().buildTranscriptionProvider(integration, inferenceProfile);
    const result = await provider.transcribe(
      { base64Data: payload.base64Data, mimeType: payload.mimeType },
      crypto.randomUUID(),
    );
    if (result.status === 'error') {
      throw new Error(buildTranscriptionErrorMessage(result.error, result.providerOutput));
    }
    await recordVoiceCall({
      bridge: ctx.multicastBridge,
      datastore: ctx.datastore,
      inferenceProfileId: inferenceProfile.id,
      integrationId: integration.id,
      kind: 'transcription',
      prices: result.prices,
      promptLabel: 'audio input',
      promptText: `[Audio input: ${payload.mimeType}${result.durationMs === undefined ? '' : `, ${result.durationMs}ms`}]`,
      responseLabel: 'transcript',
      responseText: result.text,
    });
    return {
      text: result.text,
      ...(result.language === undefined ? {} : { language: result.language }),
      ...(result.durationMs === undefined ? {} : { durationMs: result.durationMs }),
    };
  };
}

function buildTranscriptionErrorMessage(message: string | undefined, providerOutput: ProviderOutput): string {
  const head = message ?? 'Transcription failed';
  let serialized: string;
  try {
    serialized = JSON.stringify(providerOutput);
  } catch {
    serialized = String(providerOutput);
  }
  if (serialized.length === 0 || serialized === '{}') return head;
  const detail = serialized.length > 1200 ? `${serialized.slice(0, 1200)}…` : serialized;
  return `${head} | provider response: ${detail}`;
}
