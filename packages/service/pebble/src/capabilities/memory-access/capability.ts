import { AgentCapability } from '../agent-capability';
import systemPrompt from './prompts/system.md?raw';
import { buildListMemoryFilesTool } from './tools/list-files/handler';
import { buildReadMemoryFileTool } from './tools/read-file/handler';
import { buildWriteMemoryFileTool } from './tools/write-file/handler';

/**
 * Lets an agent explore and maintain memory collections referenced in the
 * conversation. The existing workspace file tools are workspace-relative
 * and cannot reach `~/.two-pebble/memories/...`; these tools are keyed by
 * `memoryId` and route through the daemon-installed memory bridge, which
 * sandboxes every read and write to the collection's stored folder.
 *
 * Configuration is intentionally empty: the tools take the `memoryId` at
 * call time, so a single registration covers every collection the agent is
 * handed.
 */
export class MemoryAccessCapability extends AgentCapability<Record<string, never>> {
  public readonly id = 'memory-access';
  public readonly description = 'Lets the agent list, read, and write files in referenced memory collections.';

  public override hookOnRegister() {
    return {
      system: systemPrompt,
      tools: [buildListMemoryFilesTool(this), buildReadMemoryFileTool(this), buildWriteMemoryFileTool(this)],
    };
  }
}
