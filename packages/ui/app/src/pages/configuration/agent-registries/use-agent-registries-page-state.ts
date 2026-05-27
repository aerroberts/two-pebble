import { emptyAgentSystemPrompt } from '@two-pebble/datatypes';
import {
  useAgentRegistries,
  useCreateAgentRegistry,
  useInferenceProfiles,
  useProjects,
  useThirdPartyAgentInstalls,
} from '@two-pebble/realtime';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { readLastViewedProjectId } from '../../../project-context';

const DEFAULT_PEBBLE_CAPABILITIES: { id: string; config: Record<string, never> }[] = [
  { id: 'workspace-access', config: {} },
  { id: 'document-writer', config: {} },
];

export function useAgentRegistriesPageState() {
  const createAgentRegistry = useCreateAgentRegistry();
  const projects = useProjects();
  const projectId = readLastViewedProjectId() ?? projects.values()[0]?.id ?? '';
  const agentRegistries = useAgentRegistries(projectId.length === 0 ? undefined : { projectId });
  const inferenceProfiles = useInferenceProfiles();
  const installs = useThirdPartyAgentInstalls();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const createPebbleRegistry = async () => {
    const profile = inferenceProfiles.values().find((entry) => entry.kind === 'intelligence');
    if (profile === undefined) {
      setCreateError('Create an intelligence inference profile before creating a Pebble agent.');
      return;
    }

    setCreateError('');
    setCreating(true);
    try {
      const created = await createAgentRegistry({
        capabilities: JSON.stringify(DEFAULT_PEBBLE_CAPABILITIES),
        inferenceProfileId: profile.id,
        name: '',
        projectId,
        systemPrompt: emptyAgentSystemPrompt(),
      });
      navigate(`/configuration/agent-registries/${created.id}`);
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Could not create agent.');
    } finally {
      setCreating(false);
    }
  };

  const createFrameworkRegistry = async () => {
    const install = installs.values()[0];
    if (install === undefined) {
      setCreateError('Create a third-party agent install before creating a framework agent.');
      return;
    }

    setCreateError('');
    setCreating(true);
    try {
      const created = await createAgentRegistry({
        name: '',
        projectId,
        systemPrompt: emptyAgentSystemPrompt(),
        thirdPartyAgentInstallId: install.id,
      });
      navigate(`/configuration/agent-registries/${created.id}`);
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Could not create agent.');
    } finally {
      setCreating(false);
    }
  };

  return {
    agentRegistries,
    createError,
    createFrameworkRegistry,
    createPebbleRegistry,
    creating,
    inferenceProfiles,
    installs,
    navigate,
  };
}
