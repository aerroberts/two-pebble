import { IconButton, Input, Section, Surface } from '@two-pebble/components';
import type { IntegrationRecord } from '@two-pebble/realtime';

interface IntegrationSettingsContentProps {
  apiKey: string;
  baseUrl: string;
  integration: IntegrationRecord;
  name: string;
  onApiKeyChange: (apiKey: string) => void;
  onApiKeyBlur: () => void;
  onBaseUrlChange: (baseUrl: string) => void;
  onBaseUrlBlur: () => void;
  onDeleteClick: () => void;
  onNameChange: (name: string) => void;
  onNameBlur: () => void;
}

export function IntegrationSettingsContent(props: IntegrationSettingsContentProps) {
  return (
    <Section
      actionItems={
        <IconButton aria-label="Delete integration" icon="trash-2" onClick={props.onDeleteClick} type="button" />
      }
      title="Configure"
    >
      <Surface>
        <Input
          label="Name"
          onBlur={props.onNameBlur}
          onChange={(event) => props.onNameChange(event.target.value)}
          value={props.name}
        />
        {props.integration.provider === 'ollama' ? (
          <Input
            label="Base URL"
            onBlur={props.onBaseUrlBlur}
            onChange={(event) => props.onBaseUrlChange(event.target.value)}
            placeholder="http://127.0.0.1:11434"
            value={props.baseUrl}
          />
        ) : null}
        {props.integration.provider === 'anthropic' ||
        props.integration.provider === 'openai' ||
        props.integration.provider === 'openrouter' ? (
          <Input
            label="API Key"
            onBlur={props.onApiKeyBlur}
            onChange={(event) => props.onApiKeyChange(event.target.value)}
            placeholder="API key"
            type="password"
            value={props.apiKey}
          />
        ) : null}
      </Surface>
    </Section>
  );
}
