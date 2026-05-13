import { ListLayout, ProviderLogo } from '@two-pebble/components';
import type { InferenceProfileRecord } from '@two-pebble/realtime';
import { getInferenceProfileModel } from './inference-profile-defaults';

interface InferenceProfilesListProps {
  emptyState: string;
  inferenceProfiles: InferenceProfileRecord[];
  onProfileClick: (profileId: string) => void;
}

export function InferenceProfilesList(props: InferenceProfilesListProps) {
  return (
    <ListLayout
      emptyState={props.emptyState}
      items={props.inferenceProfiles.map((profile) => ({
        icon: <ProviderLogo size="xs" provider={profile.provider} />,
        key: profile.id,
        onClick: () => props.onProfileClick(profile.id),
        subtitle: getInferenceProfileModel(profile),
        title: profile.name.length > 0 ? profile.name : 'Untitled profile',
        value: profile.provider,
      }))}
    />
  );
}
