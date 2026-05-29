import { AppBox, Header, IconButton, Input, PageLayout, Surface } from '@two-pebble/components';
import { useMemory, useMemoryMutations, useRealtimeDatastore } from '@two-pebble/realtime';
import { useCallback, useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { projectPath, useProjectId } from '../../project-context';

export function MemoryDetailPage() {
  const { memoryId } = useParams();
  const projectId = useProjectId();
  const navigate = useNavigate();
  const datastore = useRealtimeDatastore();
  const mutations = useMemoryMutations();
  const memory = useMemory({ id: memoryId ?? '' });

  const [draftName, setDraftName] = useState('');
  const [draftPath, setDraftPath] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const id = memoryId ?? '';
  const record = memory?.value ?? null;

  const deleteCollection = useCallback(async () => {
    await mutations.deleteMemory({ id });
    navigate(projectPath(projectId, '/memories'));
  }, [mutations, id, navigate, projectId]);

  const openCollectionFolder = useCallback(async () => {
    await datastore.memories.openFolder({ memoryId: id });
  }, [datastore, id]);

  useEffect(() => {
    if (record === null) {
      return;
    }
    setDraftName(record.name);
    setDraftPath(record.path);
    setError(null);
  }, [record]);

  if (memoryId === undefined || memoryId.length === 0) {
    return <Navigate replace to={projectPath(projectId, '/memories')} />;
  }

  if (memory === null || memory.status === 'loading') {
    return (
      <PageLayout width="fixed">
        <Header>Collection</Header>
        <AppBox variant="sidebar-empty">Loading collection.</AppBox>
      </PageLayout>
    );
  }

  if (memory.value === null) {
    return (
      <PageLayout width="fixed">
        <Header>Collection</Header>
        <AppBox variant="sidebar-empty">Collection not found.</AppBox>
      </PageLayout>
    );
  }

  const loadedRecord = memory.value;

  const saveMetadata = async () => {
    const nextName = draftName.trim();
    const nextPath = draftPath.trim();
    if (nextPath.length === 0) {
      setError('Folder path is required.');
      return;
    }
    if (nextName === loadedRecord.name && nextPath === loadedRecord.path) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await mutations.updateMemory({ id, name: nextName, path: nextPath });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not update memory.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout width="fixed">
      <Header
        actionItems={
          <div className="flex items-center gap-1">
            <IconButton
              aria-label="Open memory folder"
              icon="folder-open"
              onClick={() => void openCollectionFolder()}
              variant="secondary"
            />
            <IconButton
              aria-label="Delete memory"
              icon="trash"
              onClick={() => void deleteCollection()}
              variant="secondary"
            />
          </div>
        }
        subtitle={loadedRecord.path}
      >
        {loadedRecord.name.length > 0 ? loadedRecord.name : 'Untitled'}
      </Header>
      <Surface>
        <div className="grid gap-3">
          <Input
            disabled={saving}
            label="Name"
            onBlur={() => void saveMetadata()}
            onChange={(event) => setDraftName(event.target.value)}
            value={draftName}
          />
          <Input
            disabled={saving}
            label="Folder path"
            leadingIcon="folder"
            onBlur={() => void saveMetadata()}
            onChange={(event) => setDraftPath(event.target.value)}
            value={draftPath}
          />
          {error !== null ? <p className="text-[12px] leading-4 text-danger">{error}</p> : null}
        </div>
      </Surface>
    </PageLayout>
  );
}
