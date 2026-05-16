import type { Editor } from '@tiptap/core';
import {
  deleteTriggerRange,
  EditableHeading,
  Header,
  IconButton,
  PageLayout,
  type SlashCommand,
  SlashCommandPopover,
  type SlashTrigger,
  Surface,
  TipTapEditor,
} from '@two-pebble/components';
import { useCallback, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { DocumentAgentPills } from './document-agent-pills';
import { useDocumentEditorPageState } from './use-document-editor-page-state';

const DOCUMENT_SLASH_COMMANDS: SlashCommand[] = [
  {
    id: 'task',
    label: 'Task',
    description: 'Add a checklist item',
    icon: 'list-todo',
  },
];

export function DocumentEditorPage() {
  const state = useDocumentEditorPageState();
  const [editor, setEditor] = useState<Editor | null>(null);
  const [slashTrigger, setSlashTrigger] = useState<SlashTrigger | null>(null);

  const handleSlashSelect = useCallback(
    (command: SlashCommand) => {
      if (editor === null || slashTrigger === null) {
        setSlashTrigger(null);
        return;
      }
      if (command.id === 'task') {
        deleteTriggerRange(editor, slashTrigger);
        editor.chain().focus().insertTodoItem({ text: slashTrigger.query }).run();
      }
      setSlashTrigger(null);
    },
    [editor, slashTrigger],
  );

  if (state.documentId.length === 0) {
    return <Navigate replace to="/documents" />;
  }

  return (
    <PageLayout width="fixed">
      <Header
        compact
        actionItems={
          <>
            <IconButton
              aria-label="Add task"
              icon="list-todo"
              onClick={() => {
                if (editor === null) {
                  return;
                }
                editor.chain().focus().insertTodoItem().run();
              }}
              type="button"
              variant="secondary"
            />
            <IconButton
              aria-label="Archive document"
              icon="archive"
              onClick={() => void state.deleteDocument()}
              type="button"
              variant="secondary"
            />
          </>
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
      <div className="mt-1 pb-6">
        {state.document === null ? null : <DocumentAgentPills references={state.document.references} />}
      </div>
      {state.error.length > 0 ? <Surface>{state.error}</Surface> : null}
      {state.document === null ? (
        <Surface>Loading document.</Surface>
      ) : (
        <>
          <TipTapEditor
            key={state.documentId}
            initialContent={state.editorContent}
            placeholder="Start writing... Type / to insert a block."
            onBlur={(content) => void state.saveContent(content)}
            onEditorReady={setEditor}
            onSlashTrigger={setSlashTrigger}
          />
          <SlashCommandPopover
            anchorLeft={slashTrigger?.anchorLeft ?? 0}
            anchorTop={slashTrigger?.anchorTop ?? 0}
            commands={DOCUMENT_SLASH_COMMANDS}
            onCancel={() => setSlashTrigger(null)}
            onSelect={handleSlashSelect}
            open={slashTrigger !== null}
            query={slashTrigger?.command ?? ''}
          />
        </>
      )}
    </PageLayout>
  );
}
