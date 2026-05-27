import { Header, ListLayout, PageLayout, RelativeTime } from '@two-pebble/components';
import { useDocuments } from '@two-pebble/realtime';
import { useNavigate } from 'react-router-dom';
import { projectPath, useProjectId } from '../../project-context';

export function DocumentsPage() {
  const projectId = useProjectId();
  const documents = useDocuments({ projectId });
  const navigate = useNavigate();

  return (
    <PageLayout width="fixed">
      <Header>Documents</Header>
      <ListLayout
        emptyState={
          documents.status === 'loading' ? 'Loading documents.' : 'No documents yet — create one to get started.'
        }
        items={documents.values().map((document) => ({
          icon: 'file-text',
          key: document.id,
          onClick: () => navigate(projectPath(projectId, `/documents/${document.id}`)),
          trailingAccessory: <RelativeTime date={document.updatedAt} hideIcon />,
          title: document.name.length > 0 ? document.name : 'Untitled',
        }))}
      />
    </PageLayout>
  );
}
