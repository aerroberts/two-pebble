import { Button, EditableHeading, Header, PageLayout, Section, Surface, TipTapEditor } from '@two-pebble/components';
import { Navigate } from 'react-router-dom';
import { useDocumentEditorPageState } from './use-document-editor-page-state';

export function DocumentEditorPage() {
  const state = useDocumentEditorPageState();

  if (state.documentId.length === 0) {
    return <Navigate replace to="/documents" />;
  }

  return (
    <PageLayout width="fixed">
      <Header>
        <EditableHeading
          ariaLabel="Document name"
          onBlur={() => void state.saveName()}
          onChange={(value: string) => state.setNameDraft(value)}
          placeholder="Untitled"
          value={state.nameDraft}
        />
      </Header>
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
      <Section title="Danger Zone">
        <div className="rounded-md border border-danger/30 bg-danger-soft p-3">
          <Button
            className="border-danger bg-danger text-danger-content hover:bg-danger"
            leftIcon="trash-2"
            onClick={() => void state.deleteDocument()}
            type="button"
          >
            Delete
          </Button>
        </div>
      </Section>
    </PageLayout>
  );
}
