import { ClaudeCodeLogo, ListLayout, ProviderLogo, Section } from '@two-pebble/components';
import type {
  AgentRegistryRecord,
  InferenceProfileRecord,
  LoadableRegistry,
  ThirdPartyAgentInstallRecord,
} from '@two-pebble/realtime';

interface AgentRegistriesListProps {
  agentRegistries: LoadableRegistry<AgentRegistryRecord>;
  inferenceProfiles: LoadableRegistry<InferenceProfileRecord>;
  installs: LoadableRegistry<ThirdPartyAgentInstallRecord>;
  onRegistryClick: (registryId: string) => void;
}

interface RegistryListItem {
  icon: JSX.Element | null;
  key: string;
  onClick: () => void;
  subtitle: string;
  title: string;
}

export function AgentRegistriesList(props: AgentRegistriesListProps) {
  const allEntries = props.agentRegistries.entries();
  const pebbleEntries = allEntries.filter((entry) => entry.value.kind !== 'framework');
  const frameworkEntries = allEntries.filter((entry) => entry.value.kind === 'framework');
  const loading = props.agentRegistries.status === 'loading';

  return (
    <>
      <Section title="Pebble agents">
        <ListLayout
          emptyState={loading ? 'Loading agents.' : 'No Pebble agents configured.'}
          items={pebbleEntries.map((entry) =>
            buildPebbleListItem(entry.value, props.inferenceProfiles, props.onRegistryClick),
          )}
        />
      </Section>
      <Section title="Framework agents">
        <ListLayout
          emptyState={loading ? 'Loading agents.' : 'No framework agents configured.'}
          items={frameworkEntries.map((entry) =>
            buildFrameworkListItem(entry.value, props.installs, props.onRegistryClick),
          )}
        />
      </Section>
    </>
  );
}

type RegistryClickHandler = (registryId: string) => void;

function buildPebbleListItem(
  registry: AgentRegistryRecord,
  profiles: LoadableRegistry<InferenceProfileRecord>,
  onRegistryClick: RegistryClickHandler,
): RegistryListItem {
  const profile =
    registry.inferenceProfileId === null ? null : (profiles.getItem(registry.inferenceProfileId)?.value ?? null);
  return {
    icon: profile === null ? null : <ProviderLogo provider={profile.provider} size="xs" />,
    key: registry.id,
    onClick: () => onRegistryClick(registry.id),
    subtitle: getProfileLabel(profile),
    title: registry.name.length > 0 ? registry.name : 'Untitled agent',
  };
}

function buildFrameworkListItem(
  registry: AgentRegistryRecord,
  installs: LoadableRegistry<ThirdPartyAgentInstallRecord>,
  onRegistryClick: RegistryClickHandler,
): RegistryListItem {
  const install =
    registry.thirdPartyAgentInstallId === null
      ? null
      : (installs.getItem(registry.thirdPartyAgentInstallId)?.value ?? null);
  return {
    icon: <ClaudeCodeLogo size="xs" />,
    key: registry.id,
    onClick: () => onRegistryClick(registry.id),
    subtitle: getInstallLabel(install),
    title: registry.name.length > 0 ? registry.name : 'Untitled agent',
  };
}

type OptionalProfile = InferenceProfileRecord | null;
type OptionalInstall = ThirdPartyAgentInstallRecord | null;

function getProfileLabel(profile: OptionalProfile): string {
  if (profile === null) {
    return 'No inference profile';
  }
  return profile.name.length > 0 ? profile.name : profile.provider;
}

function getInstallLabel(install: OptionalInstall): string {
  if (install === null) {
    return 'No install configured';
  }
  return install.name.length > 0 ? install.name : install.frameworkId;
}
