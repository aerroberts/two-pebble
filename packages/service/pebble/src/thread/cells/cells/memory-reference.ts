export interface MemoryReferenceCellInput {
  memoryId: string;
  name: string;
  /**
   * Contents of the collection's `index.md`. Populated by the daemon
   * resolver; omitted at composer-insertion time and when the file is
   * missing.
   */
  index?: string;
  /**
   * Shallow file listing relative to the collection folder. Populated by
   * the resolver so the agent can navigate via `memory-read-file`.
   */
  files?: string[];
  /**
   * True when the on-disk folder is missing entirely (orphaned row).
   */
  unavailable?: boolean;
}

/**
 * A `/`-mention of a whole memory collection. Unlike `documentReference`,
 * the resolved cell injects navigation (index + file tree) rather than the
 * full corpus — collections can be huge. The agent reaches file contents
 * through the MemoryAccessCapability tools keyed by `memoryId`.
 */
export function memoryReference(input: MemoryReferenceCellInput) {
  return {
    type: 'memoryReference' as const,
    content: {
      memoryId: input.memoryId,
      name: input.name,
      ...(input.index === undefined ? {} : { index: input.index }),
      ...(input.files === undefined ? {} : { files: input.files }),
      ...(input.unavailable === undefined ? {} : { unavailable: input.unavailable }),
    },
  };
}
