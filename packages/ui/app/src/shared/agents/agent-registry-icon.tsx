import { ClaudeCodeLogo, ProviderLogo } from '@two-pebble/components';
import type { AgentRegistryRecord, InferenceProfileRecord, LoadableRegistry } from '@two-pebble/realtime';

/**
 * Picks the provider icon for an agent registry option in a dropdown.
 *
 * Framework agents always render as the Claude Code logo (the only
 * supported framework today). Pebble agents reach through their
 * inference profile to choose the matching provider logo. Returns
 * null when no logo is wired up — the dropdown row simply renders
 * without an icon, same as before this helper existed.
 */
export function agentRegistryIcon(
  registry: AgentRegistryRecord,
  profiles: LoadableRegistry<InferenceProfileRecord>,
): JSX.Element | null {
  if (registry.kind === 'framework') {
    return <ClaudeCodeLogo size="xs" />;
  }
  const profile =
    registry.inferenceProfileId === null ? null : (profiles.getItem(registry.inferenceProfileId)?.value ?? null);
  if (profile === null) {
    return null;
  }
  return <ProviderLogo provider={profile.provider} size="xs" />;
}
