import type { Editor } from '@tiptap/core';
import {
  CommentPopover,
  deleteTriggerRange,
  EditableHeading,
  Header,
  IconButton,
  PageLayout,
  type SlashTrigger,
  Surface,
  TipTapEditor,
  Tooltip,
} from '@two-pebble/components';
import { useDocuments, useTaskBoards } from '@two-pebble/realtime';
import { useCallback, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { DocumentAgentPills } from './document-agent-pills';
import { DocumentInsertPopover, type DocumentInsertSelection } from './document-insert-popover';
import { useDocumentEditorPageState } from './use-document-editor-page-state';

interface ReferenceItem {
  id: string;
  name: string;
}

interface ActiveCell {
  cellId: string;
  anchor: HTMLElement;
}

export function DocumentEditorPage() {
  const state = useDocumentEditorPageState();
  const [editor, setEditor] = useState<Editor | null>(null);
  const [slashTrigger, setSlashTrigger] = useState<SlashTrigger | null>(null);
  const [activeCell, setActiveCell] = useState<ActiveCell | null>(null);
  const documents = useDocuments();
  const boards = useTaskBoards();

  const documentItems = useMemo<ReferenceItem[]>(() => {
    const value = documents.value;
    if (value === null) {
      return [];
    }
    const rows: ReferenceItem[] = [];
    for (const entry of value.values()) {
      if (entry.value !== null && entry.value.id !== state.documentId) {
        rows.push({ id: entry.value.id, name: entry.value.name });
      }
    }
    rows.sort((left, right) => left.name.localeCompare(right.name));
    return rows;
  }, [documents.value, state.documentId]);

  const boardItems = useMemo<ReferenceItem[]>(() => {
    const value = boards.value;
    if (value === null) {
      return [];
    }
    const rows: ReferenceItem[] = [];
    for (const entry of value.values()) {
      if (entry.value !== null) {
        rows.push({ id: entry.value.id, name: entry.value.name });
      }
    }
    rows.sort((left, right) => left.name.localeCompare(right.name));
    return rows;
  }, [boards.value]);

  const handleInsertSelect = useCallback(
    (selection: DocumentInsertSelection) => {
      if (editor === null || slashTrigger === null) {
        setSlashTrigger(null);
        return;
      }
      deleteTriggerRange(editor, slashTrigger);
      if (selection.kind === 'task') {
        editor.chain().focus().insertTodoItem({ text: slashTrigger.query }).run();
      } else if (selection.kind === 'document') {
        editor
          .chain()
          .focus()
          .insertContent([
            { type: 'documentMention', attrs: { documentId: selection.item.id, name: selection.item.name } },
            { type: 'text', text: ' ' },
          ])
          .run();
      } else {
        editor
          .chain()
          .focus()
          .insertContent([
            { type: 'boardMention', attrs: { boardId: selection.item.id, name: selection.item.name } },
            { type: 'text', text: ' ' },
          ])
          .run();
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
            <Tooltip content="Add task">
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
            </Tooltip>
            <Tooltip content="Archive document">
              <IconButton
                aria-label="Archive document"
                icon="archive"
                onClick={() => void state.deleteDocument()}
                type="button"
                variant="secondary"
              />
            </Tooltip>
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
            onCellClick={(cellId, anchor) => setActiveCell({ cellId, anchor })}
            onEditorReady={setEditor}
            onSlashTrigger={setSlashTrigger}
          />
          <CommentPopover
            anchorElement={activeCell?.anchor ?? null}
            cellId={activeCell?.cellId ?? ''}
            doc={state.editorContent}
            onAddComment={(body) => {
              if (editor === null || activeCell === null) {
                return;
              }
              void state.addComment(editor, activeCell.cellId, body);
            }}
            onCancel={() => setActiveCell(null)}
            onCloseThread={(closedReason) => {
              if (editor === null || activeCell === null) {
                return;
              }
              void state.closeComment(editor, activeCell.cellId, closedReason);
            }}
            open={activeCell !== null}
          />
          <DocumentInsertPopover
            anchorLeft={slashTrigger?.anchorLeft ?? 0}
            anchorTop={slashTrigger?.anchorTop ?? 0}
            boards={boardItems}
            documents={documentItems}
            onCancel={() => setSlashTrigger(null)}
            onSelect={handleInsertSelect}
            open={slashTrigger !== null}
            query={slashTrigger?.command ?? ''}
          />
        </>
      )}
    </PageLayout>
  );
}
