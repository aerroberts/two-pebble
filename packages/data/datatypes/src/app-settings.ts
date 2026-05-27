export interface AppSettings {
  /** Default IDE used by one-click workspace opening; null disables the button. */
  defaultKnownIdeId: string | null;
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
  /**
   * Default the chat view to a folded conversation layout — each section
   * collapses the tool / model traffic between a user message and the
   * trailing assistant reply behind a click-to-expand control. Purely UI-level;
   * the persisted trace stream is unchanged.
   */
  chatConversationFoldingEnabled: boolean;
  /**
   * Agent registry id used by the document "Send to Agent" affordance. When
   * a user clicks the button on a document, a fresh copy of this registry's
   * agent launches with the document referenced as a single message. `null`
   * hides the button.
   */
  documentRunnerAgentRegistryId: string | null;
}
