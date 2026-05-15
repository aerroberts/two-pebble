import { useAgentRegistries, useInferenceProfiles, useLaunchAgent } from '@two-pebble/realtime';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { agentRegistryIcon } from '../../shared/agents/agent-registry-icon';

export function useAgentsPageState() {
  const [agentRegistryId, setAgentRegistryId] = useState('');
  const [message, setMessage] = useState('Say hello and prove the daemon agent lifecycle is wired.');
  const [launching, setLaunching] = useState(false);
  const agentRegistries = useAgentRegistries();
  const inferenceProfiles = useInferenceProfiles();
  const agentRegistryList = agentRegistries.values().sort((left, right) => left.name.localeCompare(right.name));
  const agentRegistryOptions = agentRegistryList.map((registry) => ({
    icon: agentRegistryIcon(registry, inferenceProfiles),
    label: registry.name.length > 0 ? registry.name : 'Untitled agent',
    value: registry.id,
  }));
  const launchAgent = useLaunchAgent();
  const navigate = useNavigate();

  const launchSelectedAgent = async () => {
    setLaunching(true);
    try {
      const launched = await launchAgent({
        agentRegistryId,
        message,
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
    message,
    setAgentRegistryId,
    setMessage,
  };
}
