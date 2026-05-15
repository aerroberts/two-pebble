import { EditableHeading, Header, IconButton, PageLayout, Surface, TipTapEditor } from '@two-pebble/components';
import { Navigate } from 'react-router-dom';
import { DocumentAgentPills } from './document-agent-pills';
import { useDocumentEditorPageState } from './use-document-editor-page-state';

export function DocumentEditorPage() {
  const state = useDocumentEditorPageState();

  if (state.documentId.length === 0) {
    return <Navigate replace to="/documents" />;
  }

  return (
    <PageLayout width="fixed">
      <Header
        actionItems={
          <IconButton
            aria-label="Delete document"
            icon="trash-2"
            onClick={() => void state.deleteDocument()}
            type="button"
            variant="secondary"
          />
        }
      >
        <EditableHeading
          ariaLabel="Document name"
          onBlur={() => void state.saveName()}
          onChange={(value: string) => state.setNameDraft(value)}
          placeholder="Untitled"
          value={state.nameDraft}
        />
      </Header>
      {state.document === null ? null : <DocumentAgentPills references={state.document.references} />}
      {state.error.length > 0 ? <Surface>{state.error}</Surface> : null}
      {state.document === null ? (
        <Surface>Loading document.</Surface>
      ) : (
        <TipTapEditor
          key={state.documentId}
          initialContent={state.editorContent}
          placeholder="Start writing..."
          onBlur={(content) => void state.saveContent(content)}
        />
      )}
    </PageLayout>
  );
}
