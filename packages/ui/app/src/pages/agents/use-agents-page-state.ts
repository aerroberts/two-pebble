import type { RichComposerSubmitPayload } from '@two-pebble/components';
import {
  useAgentRegistries,
  useInferenceProfiles,
  useLaunchAgent,
  useThirdPartyAgentInstalls,
} from '@two-pebble/realtime';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { agentRegistryIcon } from '../../shared/agents/agent-registry-icon';

export function useAgentsPageState() {
  const [agentRegistryId, setAgentRegistryId] = useState('');
  const [launching, setLaunching] = useState(false);
  const agentRegistries = useAgentRegistries();
  const inferenceProfiles = useInferenceProfiles();
  const installs = useThirdPartyAgentInstalls();
  const agentRegistryList = agentRegistries.values().sort((left, right) => left.name.localeCompare(right.name));
  const agentRegistryOptions = agentRegistryList.map((registry) => ({
    icon: agentRegistryIcon(registry, inferenceProfiles, installs),
    label: registry.name.length > 0 ? registry.name : 'Untitled agent',
    value: registry.id,
  }));
  const launchAgent = useLaunchAgent();
  const navigate = useNavigate();

  const launchSelectedAgent = async (payload: RichComposerSubmitPayload) => {
    if (agentRegistryId.length === 0) {
      return;
    }
    setLaunching(true);
    try {
      const launched = await launchAgent({
        agentRegistryId,
        message: payload.markdown,
        cells: payload.cells,
      });
      navigate(`/agents/${launched.id}`);
    } finally {
      setLaunching(false);
    }
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
    launchSelectedAgent,
    launching,
    setAgentRegistryId,
  };
}
