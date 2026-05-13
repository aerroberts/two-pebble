import { Header, PageLayout, Section, Surface } from '@two-pebble/components';
import { Navigate } from 'react-router-dom';
import { InferenceProfileSettingsContent } from './inference-profile-settings-content';
import { useInferenceProfileSettingsPageState } from './use-inference-profile-settings-page-state';

export function InferenceProfileSettingsPage() {
  const state = useInferenceProfileSettingsPageState();

  if (state.redirectToProfiles) {
    return <Navigate to="/configuration/inference-profiles" replace />;
  }

  if (state.profile === null || state.profile.value === null) {
    return (
      <PageLayout width="fixed">
        <Header>Inference profiles</Header>
        <Section title="Profile">
          <Surface>Loading inference profile.</Surface>
        </Section>
      </PageLayout>
    );
  }

  return (
    <PageLayout width="fixed">
      <Header>Inference profiles</Header>
      <InferenceProfileSettingsContent
        format={state.format}
        integrationOptions={state.integrationOptions}
        integrationsLoading={state.integrations.status === 'loading'}
        model={state.model}
        name={state.name}
        profile={state.profile.value}
        thinkingBudget={state.thinkingBudget}
        voice={state.voice}
        onDeleteClick={state.deleteSelectedProfile}
        onFormatBlur={state.updateFormat}
        onFormatChange={state.setFormat}
        onIntegrationChange={state.updateIntegration}
        onModelBlur={state.updateModel}
        onModelChange={state.setModel}
        onModelSelect={state.selectModel}
        onNameBlur={state.updateName}
        onNameChange={state.setName}
        onThinkingBudgetBlur={state.updateThinkingBudget}
        onThinkingBudgetChange={state.setThinkingBudget}
        onVoiceBlur={state.updateVoice}
        onVoiceChange={state.setVoice}
      />
    </PageLayout>
  );
}
