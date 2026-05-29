import { Header, PageLayout } from '@two-pebble/components';
import type { InferenceProfileKind } from '@two-pebble/realtime';
import { INFERENCE_PROFILE_KINDS } from './inference-profile-defaults';
import { InferenceProfileKindSection } from './inference-profile-kind-section';
import { useInferenceProfilesPageState } from './use-inference-profiles-page-state';

export function InferenceProfilesPage() {
  const state = useInferenceProfilesPageState();

  return (
    <PageLayout width="fixed">
      <Header subtitle="A named pairing of an integration plus model id and decoding settings — pick one of these when configuring an agent or transcription profile.">
        Inference profiles
      </Header>
      {INFERENCE_PROFILE_KINDS.map((kind: InferenceProfileKind) => (
        <InferenceProfileKindSection
          key={kind}
          compatibleIntegrations={state.integrationsForKind(kind)}
          createError={state.createError?.kind === kind ? state.createError.message : ''}
          creating={state.creatingKind === kind}
          integrationsLoading={state.integrations.status === 'loading'}
          kind={kind}
          onIntegrationSelected={(integrationId) => void state.createProfile(kind, integrationId)}
          onProfileClick={(profileId) => state.navigate(`/configuration/inference-profiles/${profileId}`)}
          profiles={state.profilesForKind(kind)}
          profilesLoading={state.inferenceProfiles.status === 'loading'}
        />
      ))}
    </PageLayout>
  );
}
