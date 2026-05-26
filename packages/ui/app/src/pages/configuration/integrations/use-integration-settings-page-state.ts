import { useDeleteIntegration, useIntegrations, useUpdateIntegration } from '@two-pebble/realtime';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export function useIntegrationSettingsPageState() {
  const integrations = useIntegrations();
  const params = useParams();
  const navigate = useNavigate();
  const integrationId = params.integrationId ?? '';
  const integration = integrations.getItem(integrationId);
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [name, setName] = useState('');
  const deleteIntegration = useDeleteIntegration();
  const updateIntegration = useUpdateIntegration();

  const deleteSelectedIntegration = () => {
    void deleteIntegration({ id: integrationId });
    navigate('/configuration/integrations');
  };

  const updateName = () => {
    if (integration?.value === null || integration?.value === undefined || name === integration.value.name) {
      return;
    }
    void updateIntegration({ ...integration.value, id: integrationId, name });
  };

  const updateApiKeyProvider = () => {
    if (integration?.value === null || integration?.value === undefined) {
      return;
    }
    if (integration.value.provider === 'ollama') {
      return;
    }
    if (integration.value.provider === 'github') {
      void updateIntegration({
        data: { token: apiKey, repos: integration.value.data.repos ?? [] },
        id: integrationId,
        name,
        provider: 'github',
      });
      return;
    }

    void updateIntegration({ data: { apiKey }, id: integrationId, name, provider: integration.value.provider });
  };

  const updateOllama = () => {
    if (integration?.value === null || integration?.value === undefined) {
      return;
    }
    if (integration.value.provider !== 'ollama') {
      return;
    }

    void updateIntegration({ data: { baseUrl }, id: integrationId, name, provider: 'ollama' });
  };

  useEffect(() => {
    if (integration?.value !== null && integration?.value !== undefined) {
      setName(integration.value.name);
      if ('apiKey' in integration.value.data) {
        setApiKey(integration.value.data.apiKey);
      }
      if ('token' in integration.value.data) {
        setApiKey(integration.value.data.token);
      }
      if ('baseUrl' in integration.value.data) {
        setBaseUrl(integration.value.data.baseUrl);
      }
    }
  }, [integration?.value]);

  return {
    apiKey,
    baseUrl,
    deleteSelectedIntegration,
    integration,
    integrationId,
    name,
    redirectToIntegrations: integrationId.length === 0,
    setApiKey,
    setBaseUrl,
    setName,
    updateApiKeyProvider,
    updateName,
    updateOllama,
  };
}
