import { Button, Header, Input, ListLayout, PageLayout, Section, Surface } from '@two-pebble/components';
import { useProjectMutations, useProjects } from '@two-pebble/realtime';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectPath, readLastViewedProjectId } from '../../project-context';

export function ProjectPickerPage() {
  const projects = useProjects();
  const mutations = useProjectMutations();
  const navigate = useNavigate();
  const [name, setName] = useState('New project');
  const [creating, setCreating] = useState(false);
  const projectList = projects.values().sort((left, right) => left.name.localeCompare(right.name));

  const createProject = async () => {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      return;
    }
    setCreating(true);
    try {
      const project = await mutations.createProject({ name: trimmed });
      navigate(projectPath(project.id, '/'));
    } finally {
      setCreating(false);
    }
  };

  const lastViewedProjectId = readLastViewedProjectId();

  return (
    <PageLayout width="fixed">
      <Header subtitle="Choose the project scope for agents, tasks, documents, and automations.">Projects</Header>
      <Section title="Projects">
        <ListLayout
          bordered
          emptyState="Create your first project."
          items={projectList.map((project) => ({
            key: project.id,
            title: project.name,
            subtitle: project.id === lastViewedProjectId ? 'Last viewed' : project.id,
            onClick: () => navigate(projectPath(project.id, '/')),
          }))}
        />
      </Section>
      <Section title="Create Project">
        <Surface>
          <div className="flex items-end gap-2">
            <Input label="Name" onChange={(event) => setName(event.target.value)} value={name} />
            <Button disabled={creating} onClick={() => void createProject()} variant="primary">
              Create
            </Button>
          </div>
        </Surface>
      </Section>
    </PageLayout>
  );
}
