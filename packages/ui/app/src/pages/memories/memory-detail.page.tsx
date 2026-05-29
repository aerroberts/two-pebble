import {
  AppBox,
  Header,
  IconButton,
  Input,
  PageLayout,
  RelativeTime,
  Surface,
  Table,
  type TableColumn,
} from '@two-pebble/components';
import { useMemory, useMemoryMutations, useRealtimeDatastore } from '@two-pebble/realtime';
import { useCallback, useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { projectPath, useProjectId } from '../../project-context';

interface MemoryFileEntry {
  path: string;
  sizeBytes: number;
  updatedAt: number;
}

type MemoryFileState =
  | { status: 'idle' | 'loading'; entries: MemoryFileEntry[]; error: null }
  | { status: 'ready'; entries: MemoryFileEntry[]; error: null }
  | { status: 'error'; entries: MemoryFileEntry[]; error: string };

const fileColumns: TableColumn<MemoryFileEntry>[] = [
  {
    id: 'path',
    header: 'File path',
    cell: (row) => <span className="break-all font-mono text-[12px]">{row.path}</span>,
  },
  {
    id: 'size',
    header: 'Size',
    align: 'right',
    cell: (row) => formatBytes(row.sizeBytes),
    width: '120px',
  },
  {
    id: 'updated',
    header: 'Last edited',
    align: 'right',
    cell: (row) => <RelativeTime date={row.updatedAt} hideIcon />,
    width: '160px',
  },
];

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
  const [files, setFiles] = useState<MemoryFileState>({ entries: [], error: null, status: 'idle' });

  const id = memoryId ?? '';
  const record = memory?.value ?? null;
  const recordId = record?.id ?? null;
  const recordPath = record?.path ?? null;

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

  useEffect(() => {
    if (recordId === null) {
      setFiles({ entries: [], error: null, status: 'idle' });
      return;
    }

    let active = true;
    const folderPath = recordPath;
    setFiles({ entries: [], error: null, status: 'loading' });
    void datastore.memories
      .listFiles({ memoryId: recordId })
      .then((response) => {
        if (!active) {
          return;
        }
        setFiles({ entries: response.entries, error: null, status: 'ready' });
      })
      .catch((caught) => {
        if (!active) {
          return;
        }
        setFiles({
          entries: [],
          error: caught instanceof Error ? caught.message : `Could not load files from ${folderPath ?? 'memory'}.`,
          status: 'error',
        });
      });

    return () => {
      active = false;
    };
  }, [datastore, recordId, recordPath]);

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
      <div className="grid gap-4">
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
        <section className="grid gap-2">
          <h2 className="font-heading text-[11px] font-normal uppercase tracking-[0.16em] text-content-muted">Files</h2>
          {files.status === 'loading' ? <Surface>Loading files.</Surface> : null}
          {files.status === 'error' ? <Surface>{files.error}</Surface> : null}
          {files.status === 'ready' ? (
            <Table
              columns={fileColumns}
              rows={files.entries}
              emptyMessage="No files in this collection."
              getRowKey={(row) => row.path}
            />
          ) : null}
        </section>
      </div>
    </PageLayout>
  );
}

function formatBytes(sizeBytes: number) {
  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  if (sizeBytes < 1024 * 1024) {
    return `${(sizeBytes / 1024).toFixed(1)} KB`;
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}
