import { IconButton, PageLayout, Section, Surface, TwoPebbleLogo } from '@two-pebble/components';
import { useProjectMutations, useProjects } from '@two-pebble/realtime';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectPath, readLastViewedProjectId } from '../../project-context';

export function ProjectPickerPage() {
  const projects = useProjects();
  const mutations = useProjectMutations();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const projectList = projects.values().sort((left, right) => left.name.localeCompare(right.name));

  const createProject = async () => {
    const name = nextProjectName(projectList.map((project) => project.name));
    setCreating(true);
    try {
      const project = await mutations.createProject({ name });
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
        <Section
          title="List your projects."
          actionItems={
            <IconButton
              aria-label="Create project"
              disabled={creating}
              icon="plus"
              onClick={() => void createProject()}
              variant="primary"
            />
          }
        >
          <div className="grid gap-2">
            {projectList.map((project) => (
              <button
                key={project.id}
                type="button"
                className="w-full text-left"
                onClick={() => navigate(projectPath(project.id, '/'))}
              >
                <Surface>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-semibold text-content">{project.name}</div>
                      <div className="text-[12px] text-content-muted">
                        {project.id === lastViewedProjectId ? 'Last viewed' : project.id}
                      </div>
                    </div>
                  </div>
                </Surface>
              </button>
            ))}
            {projectList.length === 0 ? (
              <Surface>
                <div className="text-[13px] text-content-muted">Create your first project.</div>
              </Surface>
            ) : null}
          </div>
        </Section>
      </PageLayout>
    </div>
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
