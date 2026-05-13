import type { IntegrationProvider } from '@two-pebble/realtime';
import { useCreateIntegration, useIntegrations } from '@two-pebble/realtime';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useIntegrationsPageState() {
  const createIntegration = useCreateIntegration();
  const integrations = useIntegrations();
  const navigate = useNavigate();
  const [selectingProvider, setSelectingProvider] = useState(false);
  const [creatingProvider, setCreatingProvider] = useState<IntegrationProvider | null>(null);
  const [createError, setCreateError] = useState('');

  const createIntegrationForProvider = async (provider: IntegrationProvider) => {
    setCreateError('');
    setCreatingProvider(provider);
    try {
      const created = await createIntegration(buildEmptyIntegrationInput(provider));
      setSelectingProvider(false);
      navigate(`/configuration/integrations/${created.id}`);
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Could not create integration.');
    } finally {
      setCreatingProvider(null);
    }
  };

  function buildEmptyIntegrationInput(provider: IntegrationProvider) {
    if (provider === 'ollama') {
      return { data: { baseUrl: '' }, name: '', provider } as const;
    }
    return { data: { apiKey: '' }, name: '', provider } as const;
  }

  return {
    createError,
    createIntegrationForProvider,
    creatingProvider,
    integrations,
    navigate,
    selectingProvider,
    setSelectingProvider,
  };
}
