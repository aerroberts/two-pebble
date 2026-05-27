import type { JSONContent } from '@tiptap/core';
import { ClaudeCodeLogo, CodexLogo, ProviderLogo } from '@two-pebble/components';
import { emptyAgentSystemPrompt, type TipTapDocument } from '@two-pebble/datatypes';
import {
  useAgentRegistries,
  useDeleteAgentRegistry,
  useInferenceProfiles,
  useProjects,
  useRepositories,
  useThirdPartyAgentInstalls,
  useUpdateAgentRegistry,
  type WorkspaceConfig,
  type WorkspaceConfigKind,
} from '@two-pebble/realtime';
import { createElement, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { readLastViewedProjectId } from '../../../project-context';
import { mergeCapabilities, parseCapabilitiesJson, splitCapabilities } from './capabilities/parse-capabilities';
import type { CapabilityConfigValue, CapabilitySpec, SubAgentReferenceInput } from './capabilities/types';
import { parseWorkspaceConfigString, serializeWorkspaceConfig } from './workspace-config-utils';

const DEFAULT_WORKSPACE_CONFIG: WorkspaceConfig = { kind: 'absolute', path: '' };

export function useAgentRegistrySettingsPageState() {
  const projects = useProjects();
  const projectId = readLastViewedProjectId() ?? projects.values()[0]?.id ?? '';
  const agentRegistries = useAgentRegistries(projectId.length === 0 ? undefined : { projectId });
  const inferenceProfiles = useInferenceProfiles();
  const installs = useThirdPartyAgentInstalls();
  const repositories = useRepositories();
  const params = useParams();
  const navigate = useNavigate();
  const registryId = params.registryId ?? '';
  const registry = agentRegistries.getItem(registryId);
  const registryKind = registry?.value?.kind ?? 'pebble';

  const updateAgentRegistry = useUpdateAgentRegistry();
  const deleteAgentRegistry = useDeleteAgentRegistry();

  const [name, setName] = useState('');
  const [systemPrompt, setSystemPrompt] = useState<TipTapDocument>(emptyAgentSystemPrompt);
  const [inferenceProfileId, setInferenceProfileId] = useState('');
  const [thirdPartyAgentInstallId, setThirdPartyAgentInstallId] = useState('');
  const [capabilitiesJson, setCapabilitiesJson] = useState('[]');
  const [workspaceConfig, setWorkspaceConfig] = useState<WorkspaceConfig>(DEFAULT_WORKSPACE_CONFIG);

  useEffect(() => {
    if (registry?.value !== null && registry?.value !== undefined) {
      setName(registry.value.name);
      setSystemPrompt(registry.value.systemPrompt);
      setInferenceProfileId(registry.value.inferenceProfileId ?? '');
      setThirdPartyAgentInstallId(registry.value.thirdPartyAgentInstallId ?? '');
      setCapabilitiesJson(registry.value.capabilities);
      setWorkspaceConfig(parseWorkspaceConfigString(registry.value.workspaceConfig));
    }
  }, [registry?.value]);

  const inferenceProfileOptions = inferenceProfiles
    .values()
    .filter((profile) => profile.kind === 'intelligence')
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((profile) => ({
      icon: createElement(ProviderLogo, { provider: profile.provider, size: 'xs' }),
      label: profile.name.length > 0 ? profile.name : profile.provider,
      value: profile.id,
    }));

  const installOptions = installs
    .values()
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((install) => ({
      icon: createElement(install.frameworkId === 'codex' ? CodexLogo : ClaudeCodeLogo, { size: 'xs' }),
      label: install.name.length > 0 ? install.name : install.frameworkId,
      value: install.id,
    }));

  const capabilitySpecs = useMemo(() => parseCapabilitiesJson(capabilitiesJson), [capabilitiesJson]);
  const splitView = useMemo(() => splitCapabilities(capabilitySpecs), [capabilitySpecs]);
  const otherRegistryOptions = useMemo(
    () =>
      agentRegistries
        .values()
        .filter((entry) => entry.id !== registryId)
        .sort((left, right) => left.name.localeCompare(right.name)),
    [agentRegistries, registryId],
  );

  const persistCapabilities = (next: CapabilitySpec[]) => {
    const serialized = JSON.stringify(next);
    setCapabilitiesJson(serialized);
    void updateAgentRegistry({ id: registryId, capabilities: serialized });
  };

  const setCapabilityConfig = (capabilityId: string, config: CapabilityConfigValue) => {
    const others = splitView.others;
    const existing = others.find((spec) => spec.id === capabilityId);
    const nextOthers =
      existing === undefined
        ? [...others, { id: capabilityId, config }]
        : others.map((spec) => (spec.id === capabilityId ? { ...spec, config } : spec));
    persistCapabilities(mergeCapabilities(nextOthers, splitView.references));
  };

  const removeCapability = (capabilityId: string) => {
    const nextOthers = splitView.others.filter((spec) => spec.id !== capabilityId);
    persistCapabilities(mergeCapabilities(nextOthers, splitView.references));
  };

  const setSubAgentReferences = (next: SubAgentReferenceInput[]) => {
    persistCapabilities(mergeCapabilities(splitView.others, next));
  };

  const updateName = () => {
    if (registry?.value === null || registry?.value === undefined || name === registry.value.name) {
      return;
    }
    void updateAgentRegistry({ id: registryId, name });
  };

  const updateSystemPrompt = (nextSystemPrompt: JSONContent) => {
    if (registry?.value === null || registry?.value === undefined) {
      return;
    }
    const nextDoc = nextSystemPrompt as TipTapDocument;
    if (JSON.stringify(nextDoc) === JSON.stringify(registry.value.systemPrompt)) {
      return;
    }
    setSystemPrompt(nextDoc);
    void updateAgentRegistry({ id: registryId, systemPrompt: nextDoc });
  };

  const updateInferenceProfileId = (value: string) => {
    setInferenceProfileId(value);
    if (
      registry?.value === null ||
      registry?.value === undefined ||
      value === (registry.value.inferenceProfileId ?? '')
    ) {
      return;
    }
    void updateAgentRegistry({ id: registryId, inferenceProfileId: value });
  };

  const updateThirdPartyAgentInstallId = (value: string) => {
    setThirdPartyAgentInstallId(value);
    if (
      registry?.value === null ||
      registry?.value === undefined ||
      value === (registry.value.thirdPartyAgentInstallId ?? '')
    ) {
      return;
    }
    void updateAgentRegistry({ id: registryId, thirdPartyAgentInstallId: value });
  };

  const persistWorkspaceConfig = (next: WorkspaceConfig) => {
    setWorkspaceConfig(next);
    void updateAgentRegistry({ id: registryId, workspaceConfig: serializeWorkspaceConfig(next) });
  };

  const updateWorkspaceConfigKind = (kind: WorkspaceConfigKind) => {
    if (kind === 'none') {
      persistWorkspaceConfig({ kind: 'none' });
      return;
    }
    if (kind === 'absolute') {
      const currentPath = workspaceConfig.kind === 'absolute' ? workspaceConfig.path : '';
      persistWorkspaceConfig({ kind: 'absolute', path: currentPath });
      return;
    }
    const currentRepositoryId =
      workspaceConfig.kind === 'worktree' ? workspaceConfig.repositoryId : (repositories.values()[0]?.id ?? '');
    persistWorkspaceConfig({ kind: 'worktree', repositoryId: currentRepositoryId });
  };

  const updateWorkspaceFixedPath = (path: string) => {
    persistWorkspaceConfig({ kind: 'absolute', path });
  };

  const updateWorkspaceRepositoryId = (repositoryId: string) => {
    persistWorkspaceConfig({ kind: 'worktree', repositoryId });
  };

  const deleteSelectedRegistry = () => {
    void deleteAgentRegistry({ id: registryId });
    navigate('/configuration/agent-registries');
  };

  return {
    capabilitySpecs: splitView.others,
    deleteSelectedRegistry,
    inferenceProfileId,
    inferenceProfileOptions,
    inferenceProfiles,
    installOptions,
    installs,
    name,
    otherRegistryOptions,
    redirectToRegistries: registryId.length === 0,
    registry,
    registryId,
    registryKind,
    removeCapability,
    repositories,
    setCapabilityConfig,
    setName,
    setSubAgentReferences,
    setSystemPrompt,
    subAgentReferences: splitView.references,
    systemPrompt,
    thirdPartyAgentInstallId,
    updateInferenceProfileId,
    updateName,
    updateSystemPrompt,
    updateThirdPartyAgentInstallId,
    updateWorkspaceConfigKind,
    updateWorkspaceFixedPath,
    updateWorkspaceRepositoryId,
    workspaceConfig,
  };
}
