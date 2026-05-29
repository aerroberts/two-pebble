export interface ProjectRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  /** Agent registry id that backs the Assistant for this project. */
  assistantAgentRegistryId: string | null;
  /** Current Assistant agent instance id reused across visits for this project. */
  assistantAgentId: string | null;
  /**
   * Agent registry id launched by the document "Send to Agent" affordance for
   * documents in this project. `null` hides the button.
   */
  documentRunnerAgentRegistryId: string | null;
  /**
   * Ids of the global agent registries this project exposes in its agent-select
   * dropdowns and assistant dropdown. Registries outside this set are hidden
   * from the project even though they exist globally.
   */
  enabledAgentRegistryIds: string[];
}
