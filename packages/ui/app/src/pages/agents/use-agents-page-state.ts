import type { RichComposerSubmitPayload } from '@two-pebble/components';
import {
  useInferenceProfiles,
  useLaunchAgent,
  useProjectAgentRegistries,
  useThirdPartyAgentInstalls,
} from '@two-pebble/realtime';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectPath, useProjectId } from '../../project-context';
import { agentRegistryIcon } from '../../shared/agents/agent-registry-icon';

export function useAgentsPageState() {
  const [agentRegistryId, setAgentRegistryId] = useState('');
  const projectId = useProjectId();
  const [launching, setLaunching] = useState(false);
  const agentRegistries = useProjectAgentRegistries(projectId);
  const inferenceProfiles = useInferenceProfiles();
  const installs = useThirdPartyAgentInstalls();
  const agentRegistryList = agentRegistries.values().sort((left, right) => left.name.localeCompare(right.name));
  const agentRegistryOptions = agentRegistryList.map((registry) => ({
    icon: agentRegistryIcon(registry, inferenceProfiles, installs),
    label: registry.name.length > 0 ? registry.name : 'Untitled agent',
    value: registry.id,
  }));
  const quickActionAgents = agentRegistryList
    .filter((registry) => registry.quickActionEnabled)
    .map((registry) => ({
      icon: agentRegistryIcon(registry, inferenceProfiles, installs),
      id: registry.id,
      label: registry.name.length > 0 ? registry.name : 'Untitled agent',
    }));
  const launchAgent = useLaunchAgent();
  const navigate = useNavigate();

  const launchRegistry = async (registryId: string, payload: Pick<RichComposerSubmitPayload, 'cells' | 'markdown'>) => {
    if (registryId.length === 0 || launching) {
      return;
    }
    setLaunching(true);
    try {
      const launched = await launchAgent({
        agentRegistryId: registryId,
        projectId,
        message: payload.markdown,
        cells: payload.cells,
      });
      navigate(projectPath(projectId, `/agents/${launched.id}`));
    } finally {
      setLaunching(false);
    }
  };

  const launchSelectedAgent = async (payload: RichComposerSubmitPayload) => {
    await launchRegistry(agentRegistryId, payload);
  };

  const launchQuickActionAgent = async (quickActionAgentRegistryId: string) => {
    await launchRegistry(quickActionAgentRegistryId, { cells: [], markdown: '' });
  };

  useEffect(() => {
    if (agentRegistryId.length === 0 && agentRegistryOptions[0]) {
      setAgentRegistryId(agentRegistryOptions[0].value);
    }
  }, [agentRegistryId, agentRegistryOptions]);

  return {
    agentRegistries,
    agentRegistryId,
    agentRegistryOptions,
    launchQuickActionAgent,
    launchSelectedAgent,
    launching,
    quickActionAgents,
    setAgentRegistryId,
  };
}
