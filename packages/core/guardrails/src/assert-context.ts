/**
 * Shared side-channel that the runner threads into each assertion. Today
 * only the `map` assertion uses this — it carries the registry of named
 * refs collected from earlier structure rules — but additional context
 * fields belong here as more cross-rule assertions appear.
 */
export interface AssertContext {
  refs: Map<string, string[]>;
}
