import { AppBox, AuxiliarySidebarLayout, Sidebar, SidebarOption, SidebarSection } from '@two-pebble/components';
import { type DocumentRecord, useDocumentMutations, useDocuments } from '@two-pebble/realtime';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { AppShellProps } from './app-shell-props';
import { MainAppShell } from './main-app-shell';

export function DocumentsAppShell(props: AppShellProps) {
  const documents = useDocuments();
  const mutations = useDocumentMutations();
  const location = useLocation();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const documentList = documents.values().sort((left, right) => right.updatedAt - left.updatedAt);

  const createDocument = async () => {
    setCreating(true);
    try {
      const created = await mutations.createDocument({});
      navigate(`/documents/${created.id}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <MainAppShell>
      <AuxiliarySidebarLayout
        sidebar={
          <Sidebar>
            <SidebarOption disabled={creating} icon="plus" label="New document" onClick={() => void createDocument()} />
            <SidebarSection title="Documents">
              {documentList.length === 0 ? (
                <AppBox variant="sidebar-empty">
                  {documents.status === 'loading' ? 'Loading documents.' : 'No documents yet.'}
                </AppBox>
              ) : (
                documentList.map((document) => (
                  <SidebarOption
                    active={location.pathname === `/documents/${document.id}`}
                    icon="file-text"
                    key={document.id}
                    label={displayDocumentName(document)}
                    onClick={() => navigate(`/documents/${document.id}`)}
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

function displayDocumentName(document: DocumentRecord): string {
  const name = document.name.trim();
  return name.length === 0 ? 'Untitled' : name;
}
