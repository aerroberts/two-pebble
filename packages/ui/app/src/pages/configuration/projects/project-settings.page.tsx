import { Header, Input, PageLayout, Section, Surface } from '@two-pebble/components';
import { useProjectMutations, useProjects } from '@two-pebble/realtime';
import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';

export function ProjectSettingsPage() {
  const params = useParams();
  const projectId = params.projectId ?? '';
  const projects = useProjects();
  const mutations = useProjectMutations();
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

  return (
    <PageLayout width="fixed">
      <Header subtitle={project.id}>Projects</Header>
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
    </PageLayout>
  );
}
