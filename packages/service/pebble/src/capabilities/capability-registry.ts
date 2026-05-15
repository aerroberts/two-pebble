import type { AgentCapability } from '../agent';
import type { PebbleJsonValue } from '../types';
import { AgentNamingCapability } from './agent-naming/agent-naming-capability';
import { DocumentWriterCapability } from './document-writer/document-writer-capability';
import { ParentLinkCapability } from './parent-link/parent-link-capability';
import { ProgressiveTaskListCapability } from './progressive-task-list/progressive-task-list-capability';
import { SubAgentCapability } from './sub-agent/sub-agent-capability';
import { TaskBoardAccessCapability } from './task-board-access/task-board-access-capability';
import { TaskLifecycleCapability } from './task-lifecycle/task-lifecycle-capability';
import { TurnCounterCapability } from './turn-counter/turn-counter-capability';
import { WorkspaceAccessCapability } from './workspace-access/workspace-access-capability';

/**
 * Capabilties are serialized to disk and have to be reinitialized on each agent run.
 * This allows for a capability to be reinitialized with the same config on each agent run.
 */
export class CapabilityRegistry {
  /**
   * Constructs a new capability instance for a serialized id.
   * The registry keeps persisted ids decoupled from concrete classes so
   * daemon rehydration can rebuild capabilities from datastore config.
   */
  public newCapability(id: string): AgentCapability<PebbleJsonValue> {
    if (id === 'parent-link') {
      return new ParentLinkCapability() as AgentCapability<PebbleJsonValue>;
    }
    if (id === 'progressive-task-list') {
      return new ProgressiveTaskListCapability() as AgentCapability<PebbleJsonValue>;
    }
    if (id === 'sub-agent') {
      return new SubAgentCapability() as AgentCapability<PebbleJsonValue>;
    }
    if (id === 'task-board-access') {
      return new TaskBoardAccessCapability() as AgentCapability<PebbleJsonValue>;
    }
    if (id === 'task-lifecycle') {
      return new TaskLifecycleCapability() as AgentCapability<PebbleJsonValue>;
    }
    if (id === 'workspace-access') {
      return new WorkspaceAccessCapability();
    }
    if (id === 'counter') {
      return new TurnCounterCapability() as AgentCapability<PebbleJsonValue>;
    }
    if (id === 'agent-naming') {
      return new AgentNamingCapability() as AgentCapability<PebbleJsonValue>;
    }
    if (id === 'document-writer') {
      return new DocumentWriterCapability() as AgentCapability<PebbleJsonValue>;
    }

    throw new Error(`Unknown capability id: "${id}"`);
  }
}
