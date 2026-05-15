import { ClaudeCodeLogo, CodexLogo, ProviderLogo } from '@two-pebble/components';
import type {
  AgentRegistryRecord,
  InferenceProfileRecord,
  LoadableRegistry,
  ThirdPartyAgentInstallRecord,
} from '@two-pebble/realtime';

type MaybeInstall = ThirdPartyAgentInstallRecord | null;

/**
 * Picks the provider icon for an agent registry option in a dropdown.
 *
 * Framework agents render the icon matching the bound third-party install's
 * framework (Claude Code, Codex, …). Pebble agents reach through their
 * inference profile to choose the matching provider logo. Returns null
 * when no logo is wired up — the dropdown row simply renders without an
 * icon, same as before this helper existed.
 */
export function agentRegistryIcon(
  registry: AgentRegistryRecord,
  profiles: LoadableRegistry<InferenceProfileRecord>,
  installs: LoadableRegistry<ThirdPartyAgentInstallRecord>,
): JSX.Element | null {
  if (registry.kind === 'framework') {
    const install =
      registry.thirdPartyAgentInstallId === null
        ? null
        : (installs.getItem(registry.thirdPartyAgentInstallId)?.value ?? null);
    return frameworkIcon(install);
  }
  const profile =
    registry.inferenceProfileId === null ? null : (profiles.getItem(registry.inferenceProfileId)?.value ?? null);
  if (profile === null) {
    return null;
  }
  return <ProviderLogo provider={profile.provider} size="xs" />;
}

export function frameworkIcon(install: MaybeInstall): JSX.Element {
  if (install?.frameworkId === 'codex') {
    return <CodexLogo size="xs" />;
  }
  return <ClaudeCodeLogo size="xs" />;
}
