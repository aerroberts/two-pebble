import { ProviderLogo } from '@two-pebble/components';
import {
  type InferenceProfileRecord,
  useDeleteInferenceProfile,
  useInferenceProfiles,
  useIntegrations,
  useUpdateInferenceProfile,
} from '@two-pebble/realtime';
import { createElement, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getInferenceProfileModel, providerSupportsKind } from './inference-profile-defaults';

export function useInferenceProfileSettingsPageState() {
  const inferenceProfiles = useInferenceProfiles();
  const integrations = useIntegrations();
  const params = useParams();
  const navigate = useNavigate();
  const inferenceProfileId = params.inferenceProfileId ?? '';
  const profile = inferenceProfiles.getItem(inferenceProfileId);
  const [model, setModel] = useState('');
  const [name, setName] = useState('');
  const [thinkingBudget, setThinkingBudget] = useState('');
  const [voice, setVoice] = useState('');
  const [format, setFormat] = useState('');
  const deleteInferenceProfile = useDeleteInferenceProfile();
  const updateInferenceProfile = useUpdateInferenceProfile();

  const updateProfile = (nextProfile: InferenceProfileRecord) => {
    void updateInferenceProfile(nextProfile);
  };

  const integrationOptions = useMemo(() => {
    if (profile?.value == null) {
      return [];
    }
    const profileProvider = profile.value.provider;
    const profileKind = profile.value.kind;
    return integrations
      .values()
      .filter((integration) => integration.provider === profileProvider)
      .filter((integration) => providerSupportsKind(integration.provider, profileKind))
      .sort((left, right) => left.name.localeCompare(right.name) || left.provider.localeCompare(right.provider))
      .map((integration) => ({
        icon: createElement(ProviderLogo, { provider: integration.provider, size: 'xs' }),
        label: integration.name.length > 0 ? integration.name : `Untitled ${integration.provider} integration`,
        value: integration.id,
      }));
  }, [integrations, profile?.value]);

  const deleteSelectedProfile = () => {
    void deleteInferenceProfile({ id: inferenceProfileId });
    navigate('/configuration/inference-profiles');
  };

  const updateName = () => {
    if (profile?.value == null || name === profile.value.name) {
      return;
    }
    updateProfile({ ...profile.value, name });
  };

  const updateModel = () => {
    if (profile?.value == null || model === getInferenceProfileModel(profile.value)) {
      return;
    }
    const next = withUpdatedModel(profile.value, model);
    if (next === undefined) {
      return;
    }
    updateProfile(next);
  };

  const selectModel = (modelId: string) => {
    if (profile?.value == null) {
      return;
    }
    setModel(modelId);
    if (modelId === getInferenceProfileModel(profile.value)) {
      return;
    }
    const next = withUpdatedModel(profile.value, modelId);
    if (next === undefined) {
      return;
    }
    updateProfile(next);
  };

  const updateThinkingBudget = () => {
    if (profile?.value == null || profile.value.provider !== 'anthropic') {
      return;
    }
    const parsedThinkingBudget = Number.parseInt(thinkingBudget, 10);
    if (!Number.isFinite(parsedThinkingBudget) || parsedThinkingBudget === profile.value.data.thinkingBudget) {
      return;
    }
    updateProfile({ ...profile.value, data: { ...profile.value.data, thinkingBudget: parsedThinkingBudget } });
  };

  const updateVoice = () => {
    if (profile?.value == null || profile.value.kind !== 'speech' || voice === profile.value.data.voice) {
      return;
    }
    updateProfile({ ...profile.value, data: { ...profile.value.data, voice } });
  };

  const updateFormat = () => {
    if (profile?.value == null || profile.value.kind !== 'speech' || format === (profile.value.data.format ?? '')) {
      return;
    }
    updateProfile({
      ...profile.value,
      data: { ...profile.value.data, format: format.length === 0 ? undefined : format },
    });
  };

  const updateIntegration = (integrationId: string) => {
    if (profile?.value == null || integrationId === profile.value.integrationId) {
      return;
    }
    const nextIntegration = integrations.getItem(integrationId)?.value;
    if (nextIntegration == null) {
      return;
    }
    if (nextIntegration.provider !== profile.value.provider) {
      return;
    }
    updateProfile({ ...profile.value, integrationId });
  };

  useEffect(() => {
    if (profile?.value == null) {
      return;
    }
    setModel(getInferenceProfileModel(profile.value));
    setName(profile.value.name);
    setThinkingBudget('thinkingBudget' in profile.value.data ? String(profile.value.data.thinkingBudget) : '');
    setVoice('voice' in profile.value.data ? profile.value.data.voice : '');
    setFormat('format' in profile.value.data ? (profile.value.data.format ?? '') : '');
  }, [profile?.value]);

  return {
    deleteSelectedProfile,
    format,
    inferenceProfileId,
    integrationOptions,
    integrations,
    model,
    name,
    profile,
    redirectToProfiles: inferenceProfileId.length === 0,
    selectModel,
    setFormat,
    setModel,
    setName,
    setThinkingBudget,
    setVoice,
    thinkingBudget,
    updateFormat,
    updateIntegration,
    updateModel,
    updateName,
    updateThinkingBudget,
    updateVoice,
    voice,
  };
}

function withUpdatedModel(current: InferenceProfileRecord, model: string): InferenceProfileRecord | undefined {
  if (current.kind === 'intelligence') {
    if (current.provider === 'anthropic') {
      return { ...current, data: { ...current.data, model } };
    }
    if (current.provider === 'ollama' || current.provider === 'openai' || current.provider === 'openrouter') {
      return { ...current, data: { model } };
    }
    return undefined;
  }
  if (current.kind === 'transcription') {
    return { ...current, data: { model } };
  }
  return { ...current, data: { ...current.data, model } };
}
