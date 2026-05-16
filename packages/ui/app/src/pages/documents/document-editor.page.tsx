import type { Editor } from '@tiptap/core';
import {
  EditableHeading,
  Header,
  IconButton,
  PageLayout,
  type SlashTrigger,
  SlashTaskHint,
  Surface,
  TipTapEditor,
  deleteTriggerRange,
} from '@two-pebble/components';
import { useCallback, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { DocumentAgentPills } from './document-agent-pills';
import { useDocumentEditorPageState } from './use-document-editor-page-state';

export function DocumentEditorPage() {
  const state = useDocumentEditorPageState();
  const [editor, setEditor] = useState<Editor | null>(null);
  const [slashTrigger, setSlashTrigger] = useState<SlashTrigger | null>(null);
  const taskTrigger = slashTrigger !== null && isTaskCommand(slashTrigger.command) ? slashTrigger : null;

  const commitTaskTrigger = useCallback(
    (currentEditor: Editor, trigger: SlashTrigger) => {
      deleteTriggerRange(currentEditor, trigger);
      currentEditor.chain().focus().insertTodoItem({ text: trigger.query }).run();
      setSlashTrigger(null);
    },
    [],
  );

  const handleKeyDown = useCallback(
    (currentEditor: Editor, event: KeyboardEvent): boolean => {
      if (event.key !== 'Enter' || event.shiftKey || event.isComposing) {
        return false;
      }
      if (slashTrigger === null || !isTaskCommand(slashTrigger.command)) {
        return false;
      }
      event.preventDefault();
      commitTaskTrigger(currentEditor, slashTrigger);
      return true;
    },
    [commitTaskTrigger, slashTrigger],
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
            placeholder="Start writing... Type /task to add a checklist item."
            onBlur={(content) => void state.saveContent(content)}
            onEditorReady={setEditor}
            onSlashTrigger={setSlashTrigger}
            onKeyDown={handleKeyDown}
          />
          {taskTrigger !== null ? <SlashTaskHint trigger={taskTrigger} /> : null}
        </>
      )}
    </PageLayout>
  );
}

/**
 * Treat `/t`, `/ta`, `/tas`, and `/task` as the same in-progress trigger
 * so the hint surfaces as soon as the user starts typing the command,
 * not only once they've spelled it out in full. Matches the prefix-only
 * pattern users expect from slash commands.
 */
function isTaskCommand(command: string): boolean {
  return command.length > 0 && 'task'.startsWith(command);
}
