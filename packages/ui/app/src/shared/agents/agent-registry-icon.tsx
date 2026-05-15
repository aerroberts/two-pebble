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
 * framework (Claude Code, Codex, ...). Pebble agents reach through their
 * inference profile to choose the matching provider logo. Falls back to
 * initials so agent selectors keep a stable visual affordance even when a
 * registry has not been wired to a profile yet.
 */
export function agentRegistryIcon(
  registry: AgentRegistryRecord,
  profiles: LoadableRegistry<InferenceProfileRecord>,
  installs: LoadableRegistry<ThirdPartyAgentInstallRecord>,
): JSX.Element {
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
    return <AgentRegistryInitialsIcon label={registry.name.length > 0 ? registry.name : registry.id} />;
  }
  return <ProviderLogo provider={profile.provider} size="xs" />;
}

export function frameworkIcon(install: MaybeInstall): JSX.Element {
  if (install?.frameworkId === 'codex') {
    return <CodexLogo size="xs" />;
  }
  return <ClaudeCodeLogo size="xs" />;
}

function AgentRegistryInitialsIcon(props: { label: string }): JSX.Element {
  const initials = initialsForLabel(props.label);
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded bg-surface-raised text-[9px] font-semibold leading-none text-content-muted ring-1 ring-border"
    >
      {initials}
    </span>
  );
}

function initialsForLabel(label: string): string {
  const parts = label
    .trim()
    .split(/[\s_-]+/)
    .filter((part) => part.length > 0);
  if (parts.length === 0) {
    return '?';
  }
  if (parts.length === 1) {
    return parts[0]?.slice(0, 2).toUpperCase() ?? '?';
  }
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}
