import {
  type InferenceProfileKind,
  type InferenceProfileRecord,
  type IntegrationRecord,
  useCreateInferenceProfile,
  useInferenceProfiles,
  useIntegrations,
} from '@two-pebble/realtime';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDefaultInferenceProfileInput, providerSupportsKind } from './inference-profile-defaults';

interface CreateError {
  kind: InferenceProfileKind;
  message: string;
}

export function useInferenceProfilesPageState() {
  const createInferenceProfile = useCreateInferenceProfile();
  const inferenceProfiles = useInferenceProfiles();
  const integrations = useIntegrations();
  const navigate = useNavigate();
  const [creatingKind, setCreatingKind] = useState<InferenceProfileKind | null>(null);
  const [selectingKind, setSelectingKind] = useState<InferenceProfileKind | null>(null);
  const [createError, setCreateError] = useState<CreateError | null>(null);

  const integrationList: IntegrationRecord[] = integrations
    .values()
    .sort((left, right) => left.name.localeCompare(right.name) || left.provider.localeCompare(right.provider));

  const integrationsForKind = (kind: InferenceProfileKind) =>
    integrationList.filter((integration) => providerSupportsKind(integration.provider, kind));

  const profilesForKind = (kind: InferenceProfileKind): InferenceProfileRecord[] =>
    inferenceProfiles.values().filter((profile) => profile.kind === kind);

  const startCreate = (kind: InferenceProfileKind) => {
    setCreateError(null);
    setSelectingKind(kind);
  };

  const cancelCreate = () => {
    setSelectingKind(null);
  };

  const createProfile = async (kind: InferenceProfileKind, integrationId: string) => {
    const integration = integrationsForKind(kind).find((candidate) => candidate.id === integrationId);
    if (integration === undefined) {
      setCreateError({ kind, message: 'Selected integration is no longer compatible with this profile.' });
      return;
    }
    const input = getDefaultInferenceProfileInput(integration, kind);
    if (input === undefined) {
      setCreateError({ kind, message: 'No default profile available for that integration.' });
      return;
    }

    setCreateError(null);
    setCreatingKind(kind);
    try {
      const created = await createInferenceProfile(input);
      setSelectingKind(null);
      navigate(`/configuration/inference-profiles/${created.id}`);
    } catch (error) {
      setCreateError({ kind, message: error instanceof Error ? error.message : 'Could not create inference profile.' });
    } finally {
      setCreatingKind(null);
    }
  };

  return {
    cancelCreate,
    createError,
    createProfile,
    creatingKind,
    inferenceProfiles,
    integrations,
    integrationsForKind,
    navigate,
    profilesForKind,
    selectingKind,
    startCreate,
  };
}
