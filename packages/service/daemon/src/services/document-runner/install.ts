import type { Datastore } from '@two-pebble/datastore';
import type { Logger } from '@two-pebble/logger';
import type { Agent } from '@two-pebble/pebble';
import { installCapabilityRunners } from '@two-pebble/pebble/capabilities';
import type { DaemonBridge } from '../../types';
import { DaemonDocumentRunner } from './daemon-document-runner';

interface InstallDocumentRunnerInput {
  agent: Agent;
  agentId: string;
  bridge: DaemonBridge;
  datastore: Datastore;
  logger: Logger;
}

/**
 * Constructs a per-agent `DaemonDocumentRunner` and installs it under the
 * `documentWriter` slot so the `document-writer` capability can route tool
 * calls through it. Cheap to install on every agent launch / rehydrate —
 * the runner does no work until a tool call invokes one of its methods.
 */
export function installDocumentRunner(input: InstallDocumentRunnerInput): void {
  const runner = new DaemonDocumentRunner({
    agentId: input.agentId,
    bridge: input.bridge,
    datastore: input.datastore,
    logger: input.logger,
  });
  installCapabilityRunners(input.agent, { documentWriter: runner });
}
