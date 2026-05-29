import { AppBox, Button, Header, PageLayout, Surface } from '@two-pebble/components';
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

  const [files, setFiles] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const id = memoryId ?? '';

  useEffect(() => {
    if (id.length === 0) {
      return;
    }
    setError(null);
    void datastore.memories
      .listFiles({ memoryId: id })
      .then((result) => {
        setFiles(result.files);
      })
      .catch((caught: unknown) => {
        setError(caught instanceof Error ? caught.message : String(caught));
      });
  }, [datastore, id]);

  const openFile = useCallback(
    (file: string) => {
      setSelected(file);
      setContent('');
      void datastore.memories
        .readFile({ memoryId: id, file })
        .then((result) => {
          setContent(result.content);
        })
        .catch((caught: unknown) => {
          setContent(`Failed to read ${file}: ${caught instanceof Error ? caught.message : String(caught)}`);
        });
    },
    [datastore, id],
  );

  const deleteCollection = useCallback(async () => {
    await mutations.deleteMemory({ id });
    navigate(projectPath(projectId, '/memories'));
  }, [mutations, id, navigate, projectId]);

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

  const record = memory.value;

  return (
    <PageLayout width="fixed">
      <Header
        actionItems={
          <Button onClick={() => void deleteCollection()} variant="secondary">
            Delete collection
          </Button>
        }
        subtitle={record.path}
      >
        {record.name.length > 0 ? record.name : 'Untitled'}
      </Header>
      {error === null ? (
        <div className="flex gap-4">
          <div className="flex w-[220px] shrink-0 flex-col gap-1">
            {files.length === 0 ? (
              <AppBox variant="sidebar-empty">No files yet.</AppBox>
            ) : (
              files.map((file) => (
                <button
                  className={`rounded-sm px-2 py-1 text-left text-[12px] transition-colors ${
                    file === selected
                      ? 'bg-surface-hover text-content'
                      : 'text-content-muted hover:bg-surface-hover hover:text-content'
                  }`}
                  key={file}
                  onClick={() => openFile(file)}
                  type="button"
                >
                  {file}
                </button>
              ))
            )}
          </div>
          <div className="min-w-0 flex-1">
            <Surface>
              {selected === null ? (
                <p className="text-sm text-content-muted">Select a file to view its contents.</p>
              ) : (
                <pre className="overflow-x-auto whitespace-pre-wrap break-words text-[12px] text-content">
                  {content}
                </pre>
              )}
            </Surface>
          </div>
        </div>
      ) : (
        <AppBox variant="sidebar-empty">
          This collection's folder is unavailable ({error}). The files at {record.path} may have been moved or deleted.
          Delete the collection and create a new one.
        </AppBox>
      )}
    </PageLayout>
  );
}
