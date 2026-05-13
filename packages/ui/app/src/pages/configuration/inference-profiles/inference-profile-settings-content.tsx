import { IconButton, Input, Section, Select, type SelectOption, Surface } from '@two-pebble/components';
import type { InferenceProfileRecord } from '@two-pebble/realtime';
import { getInferenceProfileKindLabel } from './inference-profile-defaults';
import { getKnownModelIds } from './known-model-ids';

interface InferenceProfileSettingsContentProps {
  format: string;
  integrationOptions: SelectOption[];
  integrationsLoading: boolean;
  model: string;
  name: string;
  onDeleteClick: () => void;
  onFormatBlur: () => void;
  onFormatChange: (format: string) => void;
  onIntegrationChange: (integrationId: string) => void;
  onModelBlur: () => void;
  onModelChange: (model: string) => void;
  onModelSelect: (model: string) => void;
  onNameBlur: () => void;
  onNameChange: (name: string) => void;
  onThinkingBudgetBlur: () => void;
  onThinkingBudgetChange: (thinkingBudget: string) => void;
  onVoiceBlur: () => void;
  onVoiceChange: (voice: string) => void;
  profile: InferenceProfileRecord;
  thinkingBudget: string;
  voice: string;
}

export function InferenceProfileSettingsContent(props: InferenceProfileSettingsContentProps) {
  const showsThinkingBudget = 'thinkingBudget' in props.profile.data;
  const showsVoice = props.profile.kind === 'speech';
  const showsFormat = props.profile.kind === 'speech';
  const knownModelOptions = buildKnownModelOptions(props.profile);
  const knownModelMatchesCurrent = knownModelOptions.some((option) => option.value === props.model);

  return (
    <>
      <Section
        actionItems={
          <IconButton
            aria-label="Delete inference profile"
            icon="trash-2"
            onClick={props.onDeleteClick}
            type="button"
          />
        }
        subtitle={getInferenceProfileKindLabel(props.profile.kind)}
        title="Profile"
      >
        <Surface>
          <Input
            label="Name"
            onBlur={props.onNameBlur}
            onChange={(event) => props.onNameChange(event.target.value)}
            value={props.name}
          />
          <Select
            fullWidth
            label="Integration"
            onChange={props.onIntegrationChange}
            options={props.integrationOptions}
            placeholder={props.integrationsLoading ? 'Loading integrations' : 'Select integration'}
            value={props.profile.integrationId}
          />
        </Surface>
      </Section>
      <Section subtitle={`Settings for ${props.profile.provider}`} title={`${props.profile.provider} configuration`}>
        <Surface>
          {knownModelOptions.length > 0 ? (
            <Select
              fullWidth
              label="Known model IDs"
              onChange={props.onModelSelect}
              options={knownModelOptions}
              placeholder="Pick a known model"
              {...(knownModelMatchesCurrent ? { value: props.model } : {})}
            />
          ) : null}
          <Input
            label="Model ID"
            onBlur={props.onModelBlur}
            onChange={(event) => props.onModelChange(event.target.value)}
            placeholder="model-id"
            value={props.model}
          />
          {showsThinkingBudget ? (
            <Input
              label="Thinking budget"
              onBlur={props.onThinkingBudgetBlur}
              onChange={(event) => props.onThinkingBudgetChange(event.target.value)}
              type="number"
              value={props.thinkingBudget}
            />
          ) : null}
          {showsVoice ? (
            <Input
              label="Voice"
              onBlur={props.onVoiceBlur}
              onChange={(event) => props.onVoiceChange(event.target.value)}
              placeholder="alloy"
              value={props.voice}
            />
          ) : null}
          {showsFormat ? (
            <Input
              label="Audio format"
              onBlur={props.onFormatBlur}
              onChange={(event) => props.onFormatChange(event.target.value)}
              placeholder="mp3"
              value={props.format}
            />
          ) : null}
        </Surface>
      </Section>
    </>
  );
}

function buildKnownModelOptions(profile: InferenceProfileRecord): SelectOption[] {
  return getKnownModelIds(profile.provider, profile.kind).map((modelId) => ({ label: modelId, value: modelId }));
}
