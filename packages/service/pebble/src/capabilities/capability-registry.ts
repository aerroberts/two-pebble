import type { AgentCapability } from '../agent';
import type { PebbleJsonValue } from '../types';
import { AgentNamingCapability } from './agent-naming/capability';
import { DocumentWriterCapability } from './document-writer/capability';
import { GithubCapability } from './github/capability';
import { ParentLinkedTaskCapability } from './parent-linked-task/capability';
import { ParentLinkedTeammateCapability } from './parent-linked-teammate/capability';
import { ProgressiveTaskListCapability } from './progressive-task-list/capability';
import { SubAgentCapability } from './sub-agent/capability';
import { TaskBoardAccessCapability } from './task-board-access/capability';
import { TurnCounterCapability } from './turn-counter/capability';
import { WorkspaceAccessCapability } from './workspace-access/capability';

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
    if (id === 'parent-linked-task') {
      return new ParentLinkedTaskCapability() as AgentCapability<PebbleJsonValue>;
    }
    if (id === 'parent-linked-teammate') {
      return new ParentLinkedTeammateCapability() as AgentCapability<PebbleJsonValue>;
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
    if (id === 'github') {
      return new GithubCapability() as AgentCapability<PebbleJsonValue>;
    }

    throw new Error(`Unknown capability id: "${id}"`);
  }
}
