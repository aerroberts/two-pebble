import { Button, Header, ListLayout, PageLayout, Section, Surface } from '@two-pebble/components';
import { useProjectMutations, useProjects } from '@two-pebble/realtime';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function ProjectsPage() {
  const projects = useProjects();
  const mutations = useProjectMutations();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const projectList = projects.values().sort((left, right) => left.name.localeCompare(right.name));

  const createProject = async () => {
    setCreateError('');
    setCreating(true);
    try {
      const project = await mutations.createProject({ name: nextProjectName(projectList.map((item) => item.name)) });
      navigate(`/configuration/projects/${project.id}`);
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Could not create project.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <PageLayout width="fixed">
      <Header subtitle="Manage project scopes used by agents, tasks, documents, and automations.">Projects</Header>
      <Section
        actionItems={
          <Button disabled={creating} leftIcon="plus" onClick={() => void createProject()} type="button">
            Add project
          </Button>
        }
        title="Projects"
      >
        {createError.length > 0 ? <Surface>{createError}</Surface> : null}
        <ListLayout
          bordered
          emptyState="No projects configured."
          items={projectList.map((project) => ({
            key: project.id,
            icon: 'folder-open',
            title: project.name.length > 0 ? project.name : 'Untitled project',
            subtitle: project.id,
            onClick: () => navigate(`/configuration/projects/${project.id}`),
          }))}
        />
      </Section>
    </PageLayout>
  );
}

function nextProjectName(names: string[]) {
  const baseName = 'New project';
  if (!names.includes(baseName)) {
    return baseName;
  }

  for (let index = 2; ; index += 1) {
    const candidate = `${baseName} ${index}`;
    if (!names.includes(candidate)) {
      return candidate;
    }
  }
}
