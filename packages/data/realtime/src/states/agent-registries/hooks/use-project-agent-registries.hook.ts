'use client';

import { useMemo } from 'react';
import { useProjects } from '../../projects/hooks/use-projects.hook';
import { useAgentRegistries } from './use-agent-registries.hook';

/**
 * Returns the agent registries a project has enabled, drawn from the global
 * registry. Registries exist globally; each project picks which appear in its
 * agent-select and assistant dropdowns via `enabledAgentRegistryIds`. An empty
 * or unknown `projectId` yields an empty (but correctly-statused) registry.
 */
export function useProjectAgentRegistries(projectId: string | undefined) {
  const agentRegistries = useAgentRegistries();
  const projects = useProjects();
  const project = projectId === undefined ? null : (projects.getItem(projectId)?.value ?? null);
  const enabledKey = project === null ? '' : project.enabledAgentRegistryIds.join(',');

  return useMemo(() => {
    const enabled = new Set(enabledKey.length === 0 ? [] : enabledKey.split(','));
    return agentRegistries
      .withItems(agentRegistries.entries().filter((entry) => enabled.has(entry.value.id)))
      .withStatus(agentRegistries.status);
  }, [agentRegistries, enabledKey]);
}
