/**
 * Defines the TranscribeAudioOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TranscribeAudioOperation {
  name: 'transcribeAudio';
  request: {
    /** Inference profile (kind=transcription) used to transcribe. */
    inferenceProfileId: string;
    /** Base64-encoded audio bytes. */
    base64Data: string;
    /** Mime type of the audio bytes (e.g. 'audio/webm', 'audio/wav'). */
    mimeType: string;
  };
  response: {
    text: string;
    language?: string;
    durationMs?: number;
  };
}
