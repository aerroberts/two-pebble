import { ProviderFactory } from '@two-pebble/pebble';
import type { DaemonProtocol } from '@two-pebble/protocol';
import type { ProtocolInboundOps, ProtocolOpByName } from '@two-pebble/ws-bridge';
import { recordVoiceCall } from '../services/voice-call-recording';
import type { DaemonHandlerContext } from '../types';

type GenerateSpeechOperation = ProtocolOpByName<ProtocolInboundOps<DaemonProtocol>, 'generateSpeech'>;
type GenerateSpeechPayload = GenerateSpeechOperation['request'];
type GenerateSpeechResponse = GenerateSpeechOperation['response'];
type ProviderOutput = object;

export function handler(ctx: DaemonHandlerContext) {
  return async function wrappedHandler(payload: GenerateSpeechPayload): Promise<GenerateSpeechResponse> {
    const inferenceProfile = await ctx.datastore.inferenceProfiles.read({ id: payload.inferenceProfileId });
    if (inferenceProfile.kind !== 'speech') {
      throw new Error(`Inference profile is not a speech profile: ${payload.inferenceProfileId}`);
    }
    const integration = await ctx.datastore.integrations.read({ id: inferenceProfile.integrationId });
    const provider = new ProviderFactory().buildSpeechProvider(integration, inferenceProfile);
    const voice = 'voice' in inferenceProfile.data ? inferenceProfile.data.voice : '';
    const result = await provider.synthesize({ text: payload.text, voice }, crypto.randomUUID());
    if (result.status === 'error') {
      throw new Error(buildSpeechErrorMessage(result.error, result.providerOutput));
    }
    const byteCount = approximateBase64ByteCount(result.base64Data);
    await recordVoiceCall({
      bridge: ctx.multicastBridge,
      datastore: ctx.datastore,
      inferenceProfileId: inferenceProfile.id,
      integrationId: integration.id,
      kind: 'speech',
      prices: result.prices,
      promptLabel: 'speech request',
      promptText: payload.text,
      responseLabel: 'speech output',
      responseText: `[Audio output: ${result.mimeType}, ${byteCount} bytes${result.durationMs === undefined ? '' : `, ${result.durationMs}ms`}]`,
    });
    return {
      base64Data: result.base64Data,
      mimeType: result.mimeType,
      ...(result.durationMs === undefined ? {} : { durationMs: result.durationMs }),
    };
  };
}

function approximateBase64ByteCount(base64: string): number {
  if (base64.length === 0) {
    return 0;
  }
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((base64.length * 3) / 4) - padding);
}

function buildSpeechErrorMessage(message: string | undefined, providerOutput: ProviderOutput): string {
  const head = message ?? 'Speech generation failed';
  const detail = serializeProviderOutput(providerOutput);
  return detail.length > 0 ? `${head} | provider response: ${detail}` : head;
}

function serializeProviderOutput(providerOutput: ProviderOutput): string {
  try {
    const serialized = JSON.stringify(providerOutput);
    return serialized.length > 1200 ? `${serialized.slice(0, 1200)}…` : serialized;
  } catch {
    return String(providerOutput);
  }
}
