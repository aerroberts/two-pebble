import { AppBox, AuxiliarySidebarLayout, Button, Sidebar, SidebarOption, SidebarSection } from '@two-pebble/components';
import { useDocumentMutations, useDocuments, type DocumentRecord } from '@two-pebble/realtime';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { AppShellProps } from './app-shell-props';
import { MainAppShell } from './main-app-shell';

interface FolderGroup {
  name: string;
  documents: DocumentRecord[];
}

export function DocumentsAppShell(props: AppShellProps) {
  const documents = useDocuments();
  const mutations = useDocumentMutations();
  const location = useLocation();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const documentList = documents.values().sort((left, right) => right.updatedAt - left.updatedAt);
  const favorites = documentList.filter(isFavoriteDocument);
  const folders = groupDocumentsByFolder(documentList);

  const createDocument = async () => {
    setCreating(true);
    try {
      const created = await mutations.createDocument({});
      navigate(`/documents/${created.id}`);
    } finally {
      setCreating(false);
    }
  };

  const renderDocumentOption = (document: DocumentRecord) => (
    <SidebarOption
      active={location.pathname === `/documents/${document.id}`}
      icon="file-text"
      key={document.id}
      label={displayDocumentName(document)}
      onClick={() => navigate(`/documents/${document.id}`)}
    />
  );

  return (
    <MainAppShell>
      <AuxiliarySidebarLayout
        sidebar={
          <Sidebar
            footer={
              <Button
                className="w-full"
                disabled={creating}
                leftIcon="plus"
                onClick={() => void createDocument()}
                type="button"
              >
                New document
              </Button>
            }
          >
            <SidebarSection title="Notes">
              <SidebarOption
                active={location.pathname === '/documents'}
                icon="list"
                label="All documents"
                onClick={() => navigate('/documents')}
              />
            </SidebarSection>
            <SidebarSection collapsible icon="clock" title="Recents">
              {documentList.length === 0 ? (
                <AppBox variant="sidebar-empty">
                  {documents.status === 'loading' ? 'Loading documents.' : 'No documents yet.'}
                </AppBox>
              ) : (
                documentList.slice(0, 12).map(renderDocumentOption)
              )}
            </SidebarSection>
            <SidebarSection collapsible icon="star" title="Favorites">
              {favorites.length === 0 ? (
                <AppBox variant="sidebar-empty">No favorite documents.</AppBox>
              ) : (
                favorites.map(renderDocumentOption)
              )}
            </SidebarSection>
            <SidebarSection collapsible icon="folder" title="Folders">
              {folders.length === 0 ? (
                <AppBox variant="sidebar-empty">Use "Folder / Title" names to group documents.</AppBox>
              ) : (
                folders.map((folder) => (
                  <SidebarSection collapsible defaultCollapsed key={folder.name} title={folder.name}>
                    {folder.documents.map(renderDocumentOption)}
                  </SidebarSection>
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

function isFavoriteDocument(document: DocumentRecord): boolean {
  const name = document.name.trim();
  return name.startsWith('*') || name.startsWith('!');
}

function groupDocumentsByFolder(documents: DocumentRecord[]): FolderGroup[] {
  const folders = new Map<string, DocumentRecord[]>();
  for (const document of documents) {
    const name = document.name.trim();
    const separatorIndex = name.indexOf('/');
    if (separatorIndex <= 0) {
      continue;
    }
    const folderName = name.slice(0, separatorIndex).trim();
    if (folderName.length === 0) {
      continue;
    }
    const existing = folders.get(folderName);
    if (existing === undefined) {
      folders.set(folderName, [document]);
    } else {
      existing.push(document);
    }
  }
  return Array.from(folders.entries())
    .map(([name, folderDocuments]) => ({ name, documents: folderDocuments }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

function displayDocumentName(document: DocumentRecord): string {
  const name = document.name.trim();
  if (name.length === 0) {
    return 'Untitled';
  }
  const separatorIndex = name.indexOf('/');
  if (separatorIndex <= 0 || separatorIndex === name.length - 1) {
    return name;
  }
  return name.slice(separatorIndex + 1).trim() || name;
}
