import type { Logger } from '@two-pebble/logger';
import type { Agent } from '@two-pebble/pebble';
import { installCapabilityRunners } from '@two-pebble/pebble/capabilities';
import type { DaemonBridge } from '../../types';
import type { TaskBoardService } from '../task-board-service';
import { DaemonTaskBoardRunner } from './daemon-task-board-runner';

interface InstallTaskBoardRunnerInput {
  agent: Agent;
  bridge: DaemonBridge;
  logger: Logger;
  taskBoards: TaskBoardService;
}

/**
 * Constructs a daemon-side task-board runner and installs it on the
 * agent. Called from every agent launch / rehydrate path so the
 * `task-board-access` capability finds its runner regardless of how
 * the agent came online. Cheap to install on every agent — the runner
 * is unused until a tool call routes through it.
 */
export function installTaskBoardRunner(input: InstallTaskBoardRunnerInput): void {
  const runner = new DaemonTaskBoardRunner({
    bridge: input.bridge,
    logger: input.logger,
    taskBoards: input.taskBoards,
  });
  installCapabilityRunners(input.agent, { taskBoard: runner });
}
