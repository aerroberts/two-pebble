import type { ConversationThread } from '../thread/index';

export interface NativeToolDefinition {
  name: string;
  description: string;
  inputSchema: object;
}

/**
 * Collects native tool registrations from a thread's cells.
 * Providers call this to build the API-shaped tools array passed alongside
 * the messages payload. A tool registered more than once is deduplicated by
 * name, keeping the most recent definition so re-registration overrides.
 */
export function collectNativeToolDefinitions(thread: ConversationThread): NativeToolDefinition[] {
  const byName = new Map<string, NativeToolDefinition>();
  for (const threadCell of thread.cells) {
    for (const cell of threadCell.cells) {
      if (cell.type !== 'toolRegistration') {
        continue;
      }
      if (cell.content.toolType !== 'native') {
        continue;
      }
      if (cell.content.inputSchema === undefined) {
        continue;
      }
      byName.set(cell.content.name, {
        name: cell.content.name,
        description: cell.content.description,
        inputSchema: cell.content.inputSchema,
      });
    }
  }
  return [...byName.values()];
}
