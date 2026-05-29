import { AppBox, AuxiliarySidebarLayout, Sidebar, SidebarOption, SidebarSection } from '@two-pebble/components';
import { type DocumentRecord, useDocumentMutations, useDocuments } from '@two-pebble/realtime';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { projectPath, useProjectId } from '../project-context';
import type { AppShellProps } from './app-shell-props';
import { MainAppShell } from './main-app-shell';

const UNSECTIONED_LABEL = 'Documents';

export function DocumentsAppShell(props: AppShellProps) {
  const projectId = useProjectId();
  const documents = useDocuments({ projectId });
  const mutations = useDocumentMutations();
  const location = useLocation();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const documentList = useMemo(
    () => documents.values().sort((left, right) => right.updatedAt - left.updatedAt),
    [documents],
  );
  const sections = useMemo(() => groupBySection(documentList), [documentList]);

  const createDocument = async () => {
    setCreating(true);
    try {
      const created = await mutations.createDocument({ projectId });
      navigate(projectPath(projectId, `/documents/${created.id}`));
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
                label="New document"
                onClick={() => void createDocument()}
              />
            }
          >
            {documentList.length === 0 ? (
              <SidebarSection title={UNSECTIONED_LABEL}>
                <AppBox variant="sidebar-empty">
                  {documents.status === 'loading' ? 'Loading documents.' : 'No documents yet.'}
                </AppBox>
              </SidebarSection>
            ) : (
              sections.map((section) => (
                <SidebarSection key={section.label} title={section.label}>
                  {section.documents.map((document) => (
                    <SidebarOption
                      active={location.pathname === projectPath(projectId, `/documents/${document.id}`)}
                      icon="file-text"
                      key={document.id}
                      label={displayDocumentName(document)}
                      onClick={() => navigate(projectPath(projectId, `/documents/${document.id}`))}
                    />
                  ))}
                </SidebarSection>
              ))
            )}
          </Sidebar>
        }
      >
        {props.children}
      </AuxiliarySidebarLayout>
    </MainAppShell>
  );
}

interface DocumentSection {
  label: string;
  documents: DocumentRecord[];
}

/**
 * Splits the flat document list into named sections keyed by each
 * document's literal `section` value. Documents without a section fall
 * into a default "Documents" bucket that renders first so top-level
 * documents stay accessible; documents whose section value coincidentally
 * equals the default label still count as named sections and render in
 * alphabetical order with the rest, so the heading is always the real
 * section the document belongs to.
 */
function groupBySection(documents: DocumentRecord[]): DocumentSection[] {
  const unsectioned: DocumentRecord[] = [];
  const namedBuckets = new Map<string, DocumentRecord[]>();
  for (const document of documents) {
    if (document.section === null) {
      unsectioned.push(document);
      continue;
    }
    const existing = namedBuckets.get(document.section) ?? [];
    existing.push(document);
    namedBuckets.set(document.section, existing);
  }
  const result: DocumentSection[] = [];
  if (unsectioned.length > 0) {
    result.push({ label: UNSECTIONED_LABEL, documents: unsectioned });
  }
  const named = Array.from(namedBuckets.entries()).sort(([leftLabel], [rightLabel]) =>
    leftLabel.localeCompare(rightLabel),
  );
  for (const [label, docs] of named) {
    result.push({ label, documents: docs });
  }
  return result;
}

function displayDocumentName(document: DocumentRecord): string {
  const name = document.name.trim();
  return name.length === 0 ? 'Untitled' : name;
}
