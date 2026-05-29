import { Header, ListLayout, PageLayout, RelativeTime } from '@two-pebble/components';
import { useMemories } from '@two-pebble/realtime';
import { useNavigate } from 'react-router-dom';
import { projectPath, useProjectId } from '../../project-context';

export function MemoriesPage() {
  const projectId = useProjectId();
  const memories = useMemories({ projectId });
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
          trailingAccessory: <RelativeTime date={memory.updatedAt} hideIcon />,
          title: memory.name.length > 0 ? memory.name : 'Untitled',
        }))}
      />
    </PageLayout>
  );
}
