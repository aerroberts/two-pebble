import { LoadingPage, NotFoundPage } from '@two-pebble/components';
import { type ProjectRecord, useProjects } from '@two-pebble/realtime';
import { createContext, type ReactNode, useContext, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

const LAST_VIEWED_PROJECT_ID_KEY = 'twoPebble.lastViewedProjectId';

interface ProjectContextValue {
  project: ProjectRecord;
  projectId: string;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider(props: { children: ReactNode }) {
  const { projectId } = useParams();
  const projects = useProjects();
  const project = projects.values().find((item) => item.id === projectId) ?? null;

  useEffect(() => {
    if (projectId !== undefined) {
      localStorage.setItem(LAST_VIEWED_PROJECT_ID_KEY, projectId);
    }
  }, [projectId]);

  const value = useMemo(() => (project === null ? null : { project, projectId: project.id }), [project]);

  if (projects.status === 'idle' || projects.status === 'loading') {
    return <LoadingPage />;
  }

  if (projectId === undefined || value === null) {
    return <NotFoundPage />;
  }

  return <ProjectContext.Provider value={value}>{props.children}</ProjectContext.Provider>;
}

export function useProject() {
  const value = useContext(ProjectContext);
  if (value === null) {
    throw new Error('useProject must be used inside ProjectProvider.');
  }
  return value;
}

export function useOptionalProject() {
  return useContext(ProjectContext);
}

export function useProjectId(): string {
  return useProject().projectId;
}

export function projectPath(projectId: string, path: string): string {
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `/project/${projectId}${suffix === '/' ? '' : suffix}`;
}

export function readLastViewedProjectId(): string | null {
  return localStorage.getItem(LAST_VIEWED_PROJECT_ID_KEY);
}
