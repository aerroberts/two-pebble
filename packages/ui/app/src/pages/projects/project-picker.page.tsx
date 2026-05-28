import { Button, Header, Input, PageLayout, Section, Surface, TwoPebbleLogo } from '@two-pebble/components';
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
    <div className="flex h-dvh min-h-0 max-h-dvh flex-col overflow-hidden bg-surface">
      <PageLayout width="fixed">
        <div className="flex flex-col items-center gap-3 pb-6 text-center">
          <TwoPebbleLogo size="large" withText text="Two Pebble" />
          <p className="max-w-md text-sm text-content-muted">
            Two Pebble is your AI development companion. Manage agents, tasks, documents, and more.
          </p>
        </div>
        <Header subtitle="Choose the project scope for agents, tasks, documents, and automations.">Projects</Header>
        <Section title="Projects">
          <div className="grid gap-2">
            {projectList.map((project) => (
              <Surface key={project.id}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-semibold text-content">{project.name}</div>
                    <div className="text-[12px] text-content-muted">
                      {project.id === lastViewedProjectId ? 'Last viewed' : project.id}
                    </div>
                  </div>
                  <Button onClick={() => navigate(projectPath(project.id, '/'))} variant="primary">
                    Open
                  </Button>
                </div>
              </Surface>
            ))}
            {projectList.length === 0 ? (
              <Surface>
                <div className="text-[13px] text-content-muted">Create your first project.</div>
              </Surface>
            ) : null}
          </div>
        </Section>
        <Section title="Create Project">
          <Surface>
            <div className="flex items-end gap-2">
              <Input label="Name" onChange={(event) => setName(event.target.value)} value={name} />
              <Button className="mb-1.5" disabled={creating} onClick={() => void createProject()} variant="primary">
                Create
              </Button>
            </div>
          </Surface>
        </Section>
      </PageLayout>
    </div>
  );
}
