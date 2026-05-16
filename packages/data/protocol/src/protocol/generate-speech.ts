/**
 * Defines the GenerateSpeechOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface GenerateSpeechOperation {
  name: 'generateSpeech';
  request: {
    /** Inference profile (kind=speech) used to synthesize. */
    inferenceProfileId: string;
    /** Text to synthesize. */
    text: string;
  };
  response: {
    /** Base64-encoded audio bytes. */
    base64Data: string;
    /** Mime type of the audio bytes (e.g. 'audio/mpeg', 'audio/wav'). */
    mimeType: string;
    /** Duration of the synthesized audio in milliseconds, if reported. */
    durationMs?: number;
  };
}
