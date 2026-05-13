import { Button, ListLayout, ProviderLogo, Section, Surface } from '@two-pebble/components';
import type { InferenceProfileKind, InferenceProfileRecord, IntegrationRecord } from '@two-pebble/realtime';
import { getInferenceProfileKindLabel, getInferenceProfileKindSubtitle } from './inference-profile-defaults';
import { InferenceProfilesList } from './inference-profiles-list';

interface InferenceProfileKindSectionProps {
  compatibleIntegrations: IntegrationRecord[];
  createError: string;
  creating: boolean;
  integrationsLoading: boolean;
  kind: InferenceProfileKind;
  onCancelCreate: () => void;
  onIntegrationSelected: (integrationId: string) => void;
  onProfileClick: (profileId: string) => void;
  onStartCreate: () => void;
  profiles: InferenceProfileRecord[];
  profilesLoading: boolean;
  selecting: boolean;
}

export function InferenceProfileKindSection(props: InferenceProfileKindSectionProps) {
  const kindLabel = getInferenceProfileKindLabel(props.kind);
  const noCompatibleIntegration = !props.integrationsLoading && props.compatibleIntegrations.length === 0;
  const emptyState = props.profilesLoading ? 'Loading profiles.' : `No ${kindLabel.toLowerCase()} profiles created.`;

  const actionItems = props.selecting ? (
    <Button disabled={props.creating} onClick={props.onCancelCreate} type="button">
      Cancel
    </Button>
  ) : (
    <Button
      disabled={props.creating || props.compatibleIntegrations.length === 0}
      leftIcon="plus"
      onClick={props.onStartCreate}
      type="button"
    >
      Create {kindLabel.toLowerCase()} profile
    </Button>
  );

  return (
    <Section actionItems={actionItems} subtitle={getInferenceProfileKindSubtitle(props.kind)} title={kindLabel}>
      {props.createError.length > 0 ? <Surface>{props.createError}</Surface> : null}
      {props.selecting ? (
        <ListLayout
          emptyState={props.integrationsLoading ? 'Loading integrations.' : 'No integrations support this profile yet.'}
          items={props.compatibleIntegrations.map((integration) => ({
            icon: <ProviderLogo size="xs" provider={integration.provider} />,
            key: integration.id,
            onClick: () => props.onIntegrationSelected(integration.id),
            subtitle: integration.provider,
            title: integration.name.length > 0 ? integration.name : `Untitled ${integration.provider} integration`,
            value: props.creating ? 'Creating…' : 'Create',
          }))}
        />
      ) : null}
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
