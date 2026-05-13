import type { Agent } from '../agent/agent';
import type { ParentLinkRunner, SubAgentRunner } from '../agent/sub-agent-runners';
import type { TaskBoardRunner } from '../agent/task-board-runner';

interface CapabilityRunners {
  parentLink?: ParentLinkRunner;
  subAgent?: SubAgentRunner;
  taskBoard?: TaskBoardRunner;
}

const runnersByAgent = new WeakMap<Agent, CapabilityRunners>();

export function installCapabilityRunners(agent: Agent, runners: CapabilityRunners): void {
  runnersByAgent.set(agent, { ...runnersByAgent.get(agent), ...runners });
}

export function getCapabilityRunners(agent: Agent): CapabilityRunners {
  return runnersByAgent.get(agent) ?? {};
}
