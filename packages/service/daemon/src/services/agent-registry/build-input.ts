import type { Datastore } from '@two-pebble/datastore';
import type { ResolveBuildInputInput, ResolveBuildInputResult } from './types';

/**
 * Resolves the launch-time build input for an agent registry row.
 * Reads the third-party install (framework kind) or the inference profile
 * plus integration (pebble kind) so the launch path can build the runtime
 * agent and emit a descriptive label.
 */
export async function resolveBuildInput(
  datastore: Datastore,
  input: ResolveBuildInputInput,
): Promise<ResolveBuildInputResult> {
  if (input.registry.kind === 'framework') {
    if (input.registry.thirdPartyAgentInstallId === null) {
      throw new Error(`agent registry "${input.registry.id}" has no third-party agent install`);
    }
    const install = await datastore.thirdPartyAgentInstalls.read({
      id: input.registry.thirdPartyAgentInstallId,
    });
    const description = `${install.name} (${install.frameworkId})`;
    return {
      description,
      registry: input.registry,
      params: { description, install, kind: 'framework', registry: input.registry },
    };
  }
  if (input.registry.inferenceProfileId === null) {
    throw new Error(`agent registry "${input.registry.id}" has no inference profile`);
  }
  const inferenceProfile = await datastore.inferenceProfiles.read({
    id: input.registry.inferenceProfileId,
  });
  const integration = await datastore.integrations.read({ id: inferenceProfile.integrationId });
  const description = `${inferenceProfile.name} (${integration.provider})`;
  return {
    description,
    registry: input.registry,
    params: { description, inferenceProfile, integration, kind: 'pebble', registry: input.registry },
  };
}
