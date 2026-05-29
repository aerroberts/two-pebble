import { Checkbox, Header, Input, PageLayout, Section, Select, Surface } from '@two-pebble/components';
import {
  useAgentRegistries,
  useInferenceProfiles,
  useProjectMutations,
  useProjects,
  useThirdPartyAgentInstalls,
} from '@two-pebble/realtime';
import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { AGENT_OPTION_NONE, buildAgentRegistryOptions } from '../../../shared/agents/build-agent-registry-options';

export function ProjectSettingsPage() {
  const params = useParams();
  const projectId = params.projectId ?? '';
  const projects = useProjects();
  const mutations = useProjectMutations();
  const agentRegistries = useAgentRegistries();
  const inferenceProfiles = useInferenceProfiles();
  const installs = useThirdPartyAgentInstalls();
  const project = projects.getItem(projectId)?.value ?? null;
  const [name, setName] = useState(project?.name ?? '');
  const [error, setError] = useState('');

  useEffect(() => {
    setName(project?.name ?? '');
  }, [project?.name]);

  if (projectId.length === 0) {
    return <Navigate replace to="/configuration/projects" />;
  }

  if (project === null) {
    return (
      <PageLayout width="fixed">
        <Header>Projects</Header>
        <Section title="Project">
          <Surface>Loading project.</Surface>
        </Section>
      </PageLayout>
    );
  }

  const enabledIds = project.enabledAgentRegistryIds;
  const enabledSet = new Set(enabledIds);
  const allRegistries = agentRegistries.values().sort((left, right) => left.name.localeCompare(right.name));
  const enabledRegistries = agentRegistries
    .withItems(agentRegistries.entries().filter((entry) => enabledSet.has(entry.value.id)))
    .withStatus(agentRegistries.status);
  const enabledOptions = buildAgentRegistryOptions(enabledRegistries, inferenceProfiles, installs);
  const assistantAgentRegistryId = project.assistantAgentRegistryId ?? AGENT_OPTION_NONE;
  const documentRunnerAgentRegistryId = project.documentRunnerAgentRegistryId ?? AGENT_OPTION_NONE;

  const updateName = async () => {
    const trimmed = name.trim();
    if (trimmed.length === 0 || trimmed === project.name) {
      setName(project.name);
      return;
    }
    setError('');
    try {
      await mutations.updateProject({ id: project.id, name: trimmed });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not update project.');
      setName(project.name);
    }
  };

  const onAssistantAgentChange = (value: string) => {
    const nextRegistryId = value === AGENT_OPTION_NONE ? null : value;
    const registryChanged = nextRegistryId !== project.assistantAgentRegistryId;
    void mutations.updateProject({
      id: project.id,
      assistantAgentRegistryId: nextRegistryId,
      assistantAgentId: registryChanged ? null : project.assistantAgentId,
    });
  };

  const onDocumentRunnerChange = (value: string) => {
    void mutations.updateProject({
      id: project.id,
      documentRunnerAgentRegistryId: value === AGENT_OPTION_NONE ? null : value,
    });
  };

  const onToggleEnabled = (registryId: string, enabled: boolean) => {
    const next = enabled ? [...enabledIds, registryId] : enabledIds.filter((id) => id !== registryId);
    const nextSet = new Set(next);
    // Drop assistant / document-runner selections that are no longer enabled.
    const assistantStillEnabled =
      project.assistantAgentRegistryId === null || nextSet.has(project.assistantAgentRegistryId);
    const runnerStillEnabled =
      project.documentRunnerAgentRegistryId === null || nextSet.has(project.documentRunnerAgentRegistryId);
    void mutations.updateProject({
      id: project.id,
      enabledAgentRegistryIds: next,
      ...(assistantStillEnabled ? {} : { assistantAgentRegistryId: null, assistantAgentId: null }),
      ...(runnerStillEnabled ? {} : { documentRunnerAgentRegistryId: null }),
    });
  };

  return (
    <PageLayout width="fixed">
      <Header subtitle={project.id}>{project.name.length > 0 ? project.name : 'Untitled project'}</Header>
      <Section title="Configure">
        {error.length > 0 ? <Surface>{error}</Surface> : null}
        <Surface>
          <Input
            label="Name"
            onBlur={() => void updateName()}
            onChange={(event) => setName(event.target.value)}
            value={name}
          />
        </Surface>
      </Section>
      <Section subtitle="Agent registry that powers the Assistant for this project." title="Assistant agent">
        <Surface>
          <Select
            fullWidth
            label="Assistant agent"
            onChange={onAssistantAgentChange}
            options={enabledOptions}
            placeholder={enabledOptions.length <= 1 ? 'Enable an agent below first' : 'Select agent'}
            value={assistantAgentRegistryId}
          />
        </Surface>
      </Section>
      <Section
        subtitle="Agent launched by the 'Send to Agent' button on this project's documents."
        title="Document runner agent"
      >
        <Surface>
          <Select
            fullWidth
            label="Document runner agent"
            onChange={onDocumentRunnerChange}
            options={enabledOptions}
            placeholder={enabledOptions.length <= 1 ? 'Enable an agent below first' : 'Select agent'}
            value={documentRunnerAgentRegistryId}
          />
        </Surface>
      </Section>
      <Section
        subtitle="Agents from the global registry that appear in this project's agent-select and assistant dropdowns."
        title="Enabled agents"
      >
        <Surface>
          {allRegistries.length === 0 ? (
            <span className="text-content-subtle text-[12px]">Create an agent in the global agent registry first.</span>
          ) : (
            allRegistries.map((registry) => (
              <Checkbox
                checked={enabledSet.has(registry.id)}
                key={registry.id}
                label={registry.name.length > 0 ? registry.name : 'Untitled agent'}
                onChange={(event) => onToggleEnabled(registry.id, event.target.checked)}
              />
            ))
          )}
        </Surface>
      </Section>
    </PageLayout>
  );
}
