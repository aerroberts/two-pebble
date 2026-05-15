import { Button, Header, ListLayout, PageLayout, RelativeTime, Surface } from '@two-pebble/components';
import { useDocumentMutations, useDocuments } from '@two-pebble/realtime';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function DocumentsPage() {
  const documents = useDocuments();
  const mutations = useDocumentMutations();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const createDocument = async () => {
    setError('');
    setCreating(true);
    try {
      const created = await mutations.createDocument({});
      navigate(`/documents/${created.id}`);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not create document.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <PageLayout width="fixed">
      <Header
        actionItems={
          <Button disabled={creating} leftIcon="plus" onClick={() => void createDocument()} type="button">
            New document
          </Button>
        }
      >
        Documents
      </Header>
      {error.length > 0 ? <Surface>{error}</Surface> : null}
      <ListLayout
        emptyState={
          documents.status === 'loading' ? 'Loading documents.' : 'No documents yet — create one to get started.'
        }
        items={documents.values().map((document) => ({
          icon: 'file-text',
          key: document.id,
          onClick: () => navigate(`/documents/${document.id}`),
          trailingAccessory: <RelativeTime date={document.updatedAt} />,
          title: document.name.length > 0 ? document.name : 'Untitled',
        }))}
      />
    </PageLayout>
  );
}
