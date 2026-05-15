export interface AppSettings {
  /** Default transcription inference profile id used by voice capture flows. */
  defaultTranscriptionProfileId: string | null;
  /** Default speech (TTS) inference profile id used by speech output flows. */
  defaultSpeechProfileId: string | null;
  /** Agent registry id that powers the Assistant feature. */
  assistantAgentRegistryId: string | null;
  /** Current agent instance id that the Assistant page reuses across visits. */
  assistantAgentId: string | null;
  /** Enable Command-K global shortcut to open the assistant speech overlay. */
  assistantCommandKEnabled: boolean;
  /** When the Command-K overlay opens, auto-start the mic instead of showing the text+voice composer. */
  assistantCommandKVoiceModeEnabled: boolean;
}
