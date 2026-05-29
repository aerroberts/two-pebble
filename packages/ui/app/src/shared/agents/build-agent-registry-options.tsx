import type { SelectOption } from '@two-pebble/components';
import type {
  AgentRegistryRecord,
  InferenceProfileRecord,
  LoadableRegistry,
  ThirdPartyAgentInstallRecord,
} from '@two-pebble/realtime';
import { agentRegistryIcon } from './agent-registry-icon';

export const AGENT_OPTION_NONE = '__none__';

/**
 * Builds Select options for a set of agent registries, sorted by name and
 * prefixed with a "None" choice. Shared by the project Assistant / document
 * runner pickers.
 */
export function buildAgentRegistryOptions(
  registries: LoadableRegistry<AgentRegistryRecord>,
  profiles: LoadableRegistry<InferenceProfileRecord>,
  installs: LoadableRegistry<ThirdPartyAgentInstallRecord>,
): SelectOption[] {
  const matching = registries
    .values()
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((registry) => ({
      icon: agentRegistryIcon(registry, profiles, installs),
      label: registry.name.length > 0 ? registry.name : 'Untitled agent',
      value: registry.id,
    }));
  return [{ label: 'None', value: AGENT_OPTION_NONE }, ...matching];
}
