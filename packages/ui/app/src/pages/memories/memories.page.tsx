import { Header, IconButton, ListLayout, PageLayout, RelativeTime } from '@two-pebble/components';
import { useMemories, useMemoryMutations, useRealtimeDatastore } from '@two-pebble/realtime';
import { useNavigate } from 'react-router-dom';
import { projectPath, useProjectId } from '../../project-context';

export function MemoriesPage() {
  const projectId = useProjectId();
  const memories = useMemories({ projectId });
  const datastore = useRealtimeDatastore();
  const mutations = useMemoryMutations();
  const navigate = useNavigate();

  return (
    <PageLayout width="fixed">
      <Header>Memories</Header>
      <ListLayout
        emptyState={
          memories.status === 'loading' ? 'Loading memories.' : 'No collections yet — create one to get started.'
        }
        items={memories.values().map((memory) => ({
          icon: 'brain',
          key: memory.id,
          onClick: () => navigate(projectPath(projectId, `/memories/${memory.id}`)),
          subtitle: memory.path,
          trailingAccessory: (
            <div className="flex items-center gap-1">
              <RelativeTime date={memory.updatedAt} hideIcon />
              <IconButton
                aria-label={`Open ${memory.name.length > 0 ? memory.name : 'memory'} folder`}
                icon="folder-open"
                onClick={() => void datastore.memories.openFolder({ memoryId: memory.id })}
                variant="secondary"
              />
              <IconButton
                aria-label={`Delete ${memory.name.length > 0 ? memory.name : 'memory'}`}
                icon="trash"
                onClick={() => void mutations.deleteMemory({ id: memory.id })}
                variant="secondary"
              />
            </div>
          ),
          title: memory.name.length > 0 ? memory.name : 'Untitled',
        }))}
      />
    </PageLayout>
  );
}
