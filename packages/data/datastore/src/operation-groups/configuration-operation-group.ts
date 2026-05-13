import type { DatastoreOperationBinder } from '../datastore-operation-binder';
import { agentRegistriesCreateOperation } from '../operations/agent-registries.create';
import { agentRegistriesDeleteOperation } from '../operations/agent-registries.delete';
import { agentRegistriesListOperation } from '../operations/agent-registries.list';
import { agentRegistriesReadOperation } from '../operations/agent-registries.read';
import { agentRegistriesUpdateOperation } from '../operations/agent-registries.update';
import { appSettingsReadOperation } from '../operations/app-settings.read';
import { appSettingsUpdateOperation } from '../operations/app-settings.update';
import { inferenceProfilesCreateOperation } from '../operations/inference-profiles.create';
import { inferenceProfilesDeleteOperation } from '../operations/inference-profiles.delete';
import { inferenceProfilesListOperation } from '../operations/inference-profiles.list';
import { inferenceProfilesReadOperation } from '../operations/inference-profiles.read';
import { inferenceProfilesUpdateOperation } from '../operations/inference-profiles.update';
import { integrationsCreateOperation } from '../operations/integrations.create';
import { integrationsDeleteOperation } from '../operations/integrations.delete';
import { integrationsListOperation } from '../operations/integrations.list';
import { integrationsReadOperation } from '../operations/integrations.read';
import { integrationsUpdateOperation } from '../operations/integrations.update';
import { thirdPartyAgentInstallsCreateOperation } from '../operations/third-party-agent-installs.create';
import { thirdPartyAgentInstallsDeleteOperation } from '../operations/third-party-agent-installs.delete';
import { thirdPartyAgentInstallsListOperation } from '../operations/third-party-agent-installs.list';
import { thirdPartyAgentInstallsReadOperation } from '../operations/third-party-agent-installs.read';
import { thirdPartyAgentInstallsUpdateOperation } from '../operations/third-party-agent-installs.update';

/**
 * Binds third-party integration persistence handlers.
 *
 * Integrations are global connection records, not agent-owned records.
 */
export function bindIntegrationOperationGroup(bind: DatastoreOperationBinder) {
  return {
    create: bind(integrationsCreateOperation, 'integrations.create'),
    delete: bind(integrationsDeleteOperation, 'integrations.delete'),
    list: bind(integrationsListOperation, 'integrations.list'),
    read: bind(integrationsReadOperation, 'integrations.read'),
    update: bind(integrationsUpdateOperation, 'integrations.update'),
  };
}

/**
 * Binds third-party agent install persistence handlers.
 *
 * Each row represents a framework agent binary available on this machine.
 */
export function bindThirdPartyAgentInstallOperationGroup(bind: DatastoreOperationBinder) {
  return {
    create: bind(thirdPartyAgentInstallsCreateOperation, 'third-party-agent-installs.create'),
    delete: bind(thirdPartyAgentInstallsDeleteOperation, 'third-party-agent-installs.delete'),
    list: bind(thirdPartyAgentInstallsListOperation, 'third-party-agent-installs.list'),
    read: bind(thirdPartyAgentInstallsReadOperation, 'third-party-agent-installs.read'),
    update: bind(thirdPartyAgentInstallsUpdateOperation, 'third-party-agent-installs.update'),
  };
}

/**
 * Binds inference profile persistence handlers.
 *
 * Profiles bind integrations to model-level runtime settings.
 */
export function bindInferenceProfileOperationGroup(bind: DatastoreOperationBinder) {
  return {
    create: bind(inferenceProfilesCreateOperation, 'inference-profiles.create'),
    delete: bind(inferenceProfilesDeleteOperation, 'inference-profiles.delete'),
    list: bind(inferenceProfilesListOperation, 'inference-profiles.list'),
    read: bind(inferenceProfilesReadOperation, 'inference-profiles.read'),
    update: bind(inferenceProfilesUpdateOperation, 'inference-profiles.update'),
  };
}

/**
 * Binds singleton app settings persistence handlers.
 *
 * Read returns defaults if no row exists, and update upserts.
 */
export function bindAppSettingsOperationGroup(bind: DatastoreOperationBinder) {
  return {
    read: bind(appSettingsReadOperation, 'app-settings.read'),
    update: bind(appSettingsUpdateOperation, 'app-settings.update'),
  };
}

/**
 * Binds agent registry persistence handlers.
 *
 * Registry rows describe launchable agent configurations.
 */
export function bindAgentRegistryOperationGroup(bind: DatastoreOperationBinder) {
  return {
    create: bind(agentRegistriesCreateOperation, 'agent-registries.create'),
    delete: bind(agentRegistriesDeleteOperation, 'agent-registries.delete'),
    list: bind(agentRegistriesListOperation, 'agent-registries.list'),
    read: bind(agentRegistriesReadOperation, 'agent-registries.read'),
    update: bind(agentRegistriesUpdateOperation, 'agent-registries.update'),
  };
}
