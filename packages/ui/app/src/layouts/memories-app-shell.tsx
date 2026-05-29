import { AppBox, AuxiliarySidebarLayout, Sidebar, SidebarOption, SidebarSection } from '@two-pebble/components';
import { useMemories, useMemoryMutations } from '@two-pebble/realtime';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { projectPath, useProjectId } from '../project-context';
import type { AppShellProps } from './app-shell-props';
import { MainAppShell } from './main-app-shell';

export function MemoriesAppShell(props: AppShellProps) {
  const projectId = useProjectId();
  const memories = useMemories({ projectId });
  const mutations = useMemoryMutations();
  const location = useLocation();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const memoryList = useMemo(
    () => memories.values().sort((left, right) => right.updatedAt - left.updatedAt),
    [memories],
  );

  const createMemory = async () => {
    setCreating(true);
    try {
      const created = await mutations.createMemory({ name: 'Untitled', projectId });
      navigate(projectPath(projectId, `/memories/${created.id}`));
    } finally {
      setCreating(false);
    }
  };

  return (
    <MainAppShell>
      <AuxiliarySidebarLayout
        sidebar={
          <Sidebar
            footer={
              <SidebarOption
                disabled={creating}
                icon="plus"
                label="New collection"
                onClick={() => void createMemory()}
              />
            }
          >
            <SidebarSection title="Memories">
              {memoryList.length === 0 ? (
                <AppBox variant="sidebar-empty">
                  {memories.status === 'loading' ? 'Loading memories.' : 'No collections yet.'}
                </AppBox>
              ) : (
                memoryList.map((memory) => (
                  <SidebarOption
                    active={location.pathname === projectPath(projectId, `/memories/${memory.id}`)}
                    icon="brain"
                    key={memory.id}
                    label={memory.name.length > 0 ? memory.name : 'Untitled'}
                    onClick={() => navigate(projectPath(projectId, `/memories/${memory.id}`))}
                  />
                ))
              )}
            </SidebarSection>
          </Sidebar>
        }
      >
        {props.children}
      </AuxiliarySidebarLayout>
    </MainAppShell>
  );
}
