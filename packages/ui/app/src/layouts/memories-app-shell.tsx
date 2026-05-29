import {
  AppBox,
  AuxiliarySidebarLayout,
  Button,
  Input,
  Modal,
  ModalActions,
  ModalBody,
  Sidebar,
  SidebarOption,
  SidebarSection,
} from '@two-pebble/components';
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
  const [createError, setCreateError] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const memoryList = useMemo(
    () => memories.values().sort((left, right) => right.updatedAt - left.updatedAt),
    [memories],
  );

  const createMemory = async (input: { description: string; name: string; path: string }) => {
    setCreating(true);
    setCreateError(null);
    try {
      const created = await mutations.createMemory({
        description: input.description,
        name: input.name,
        path: input.path,
        projectId,
      });
      setCreateModalOpen(false);
      navigate(projectPath(projectId, `/memories/${created.id}`));
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Could not create memory collection.');
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
                onClick={() => setCreateModalOpen(true)}
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
      {createModalOpen ? (
        <CreateMemoryModal
          error={createError}
          saving={creating}
          onClose={() => {
            setCreateError(null);
            setCreateModalOpen(false);
          }}
          onCreate={(input) => void createMemory(input)}
        />
      ) : null}
    </MainAppShell>
  );
}

function CreateMemoryModal(props: {
  error: string | null;
  onClose: () => void;
  onCreate: (input: { description: string; name: string; path: string }) => void;
  saving: boolean;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [folderPath, setFolderPath] = useState('');

  const trimmedName = name.trim();
  const trimmedDescription = description.trim();
  const trimmedPath = folderPath.trim();
  const saveDisabled = props.saving || trimmedName.length === 0 || trimmedPath.length === 0;

  return (
    <Modal
      onClose={props.onClose}
      open
      subtitle="Choose the folder where this memory collection's markdown files should live."
      title="New memory collection"
    >
      <ModalBody>
        <Input
          label="Name"
          onChange={(event) => setName(event.target.value)}
          placeholder="Project notes"
          value={name}
        />
        <Input
          label="Description"
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What this collection stores"
          value={description}
        />
        <Input
          label="Folder path"
          leadingIcon="folder"
          onChange={(event) => setFolderPath(event.target.value)}
          placeholder="/Users/you/memories/project-notes"
          value={folderPath}
        />
        {props.error !== null ? <p className="text-[12px] leading-4 text-danger">{props.error}</p> : null}
        <ModalActions>
          <Button disabled={props.saving} onClick={props.onClose}>
            Cancel
          </Button>
          <Button
            disabled={saveDisabled}
            onClick={() => props.onCreate({ description: trimmedDescription, name: trimmedName, path: trimmedPath })}
            variant="primary"
          >
            {props.saving ? 'Creating' : 'Create collection'}
          </Button>
        </ModalActions>
      </ModalBody>
    </Modal>
  );
}
