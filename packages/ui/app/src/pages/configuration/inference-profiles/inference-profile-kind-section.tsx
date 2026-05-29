import { ProviderLogo, Section, Select, type SelectOption, Surface } from '@two-pebble/components';
import type { InferenceProfileKind, InferenceProfileRecord, IntegrationRecord } from '@two-pebble/realtime';
import { getInferenceProfileKindLabel, getInferenceProfileKindSubtitle } from './inference-profile-defaults';
import { InferenceProfilesList } from './inference-profiles-list';

interface InferenceProfileKindSectionProps {
  compatibleIntegrations: IntegrationRecord[];
  createError: string;
  creating: boolean;
  integrationsLoading: boolean;
  kind: InferenceProfileKind;
  onIntegrationSelected: (integrationId: string) => void;
  onProfileClick: (profileId: string) => void;
  profiles: InferenceProfileRecord[];
  profilesLoading: boolean;
}

export function InferenceProfileKindSection(props: InferenceProfileKindSectionProps) {
  const kindLabel = getInferenceProfileKindLabel(props.kind);
  const noCompatibleIntegration = !props.integrationsLoading && props.compatibleIntegrations.length === 0;
  const emptyState = props.profilesLoading ? 'Loading profiles.' : `No ${kindLabel.toLowerCase()} profiles created.`;

  const integrationOptions: SelectOption[] = props.compatibleIntegrations.map((integration) => ({
    icon: <ProviderLogo size="xs" provider={integration.provider} />,
    label: integration.name.length > 0 ? integration.name : `Untitled ${integration.provider} integration`,
    value: integration.id,
  }));

  const createPlaceholder = props.creating ? 'Creating…' : `Create ${kindLabel.toLowerCase()} profile`;

  const actionItems = (
    <Select
      disabled={props.creating || props.compatibleIntegrations.length === 0}
      onChange={props.onIntegrationSelected}
      options={integrationOptions}
      placeholder={createPlaceholder}
      value=""
    />
  );

  return (
    <Section actionItems={actionItems} subtitle={getInferenceProfileKindSubtitle(props.kind)} title={kindLabel}>
      {props.createError.length > 0 ? <Surface>{props.createError}</Surface> : null}
      <InferenceProfilesList
        emptyState={emptyState}
        inferenceProfiles={props.profiles}
        onProfileClick={props.onProfileClick}
      />
      {noCompatibleIntegration ? (
        <Surface>No integration supports {kindLabel.toLowerCase()} profiles yet.</Surface>
      ) : null}
    </Section>
  );
}
