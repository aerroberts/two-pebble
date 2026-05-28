import type { Editor } from '@tiptap/core';
import {
  type AutocompleteSuggestion,
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
  useToast,
} from '@two-pebble/components';
import { Cell } from '@two-pebble/pebble';
import { useAppSettings, useDocuments, useLaunchAgent, useTaskBoards } from '@two-pebble/realtime';
import { useCallback, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useProjectId } from '../../project-context';
import { DocumentAgentPills } from './document-agent-pills';
import { DocumentInsertPopover, type DocumentInsertSelection } from './document-insert-popover';
import { DocumentSectionPicker } from './document-section-picker';
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
  const projectId = useProjectId();
  const [editor, setEditor] = useState<Editor | null>(null);
  const [slashTrigger, setSlashTrigger] = useState<SlashTrigger | null>(null);
  const [activeCell, setActiveCell] = useState<ActiveCell | null>(null);
  const documents = useDocuments({ projectId });
  const boards = useTaskBoards({ projectId });
  const appSettings = useAppSettings();
  const launchAgent = useLaunchAgent();
  const navigate = useNavigate();
  const { toast } = useToast();
  const documentRunnerRegistryId = appSettings.value?.documentRunnerAgentRegistryId ?? null;

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

  const sectionSuggestions = useMemo<AutocompleteSuggestion[]>(() => {
    const seen = new Set<string>();
    const labels: string[] = [];
    const value = documents.value;
    if (value !== null) {
      for (const entry of value.values()) {
        const section = entry.value?.section;
        if (typeof section === 'string' && section.length > 0 && !seen.has(section)) {
          seen.add(section);
          labels.push(section);
        }
      }
      labels.sort((left, right) => left.localeCompare(right));
    }
    return labels.map((label) => ({ label, value: label }));
  }, [documents.value]);

  const currentSection = state.document?.section ?? '';

  const commitSection = useCallback(
    (next: string) => {
      const trimmed = next.trim();
      if (trimmed.length === 0) {
        void state.setSection(null);
        return;
      }
      void state.setSection(trimmed);
    },
    [state],
  );

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

  const handleSendToAgent = useCallback(async () => {
    if (documentRunnerRegistryId === null) {
      toast('Pick a document runner agent in settings first.', 'error');
      return;
    }
    if (state.document === null) {
      return;
    }
    try {
      const launched = await launchAgent({
        agentRegistryId: documentRunnerRegistryId,
        projectId,
        message: state.document.name,
        cells: [
          Cell.documentReference({
            documentId: state.document.id,
            name: state.document.name,
            contentSnapshot: '',
            documentUpdatedAt: 0,
          }),
        ],
      });
      toast('Sent document to agent.', 'success');
      navigate(`/agents/${launched.id}`);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : 'Could not launch agent.';
      toast(message, 'error');
    }
  }, [documentRunnerRegistryId, launchAgent, navigate, projectId, state.document, toast]);

  if (state.documentId.length === 0) {
    return <Navigate replace to="/documents" />;
  }

  return (
    <PageLayout width="fixed">
      <Header
        compact
        actionItems={
          <>
            {state.document === null ? null : (
              <DocumentSectionPicker
                currentSection={currentSection}
                onCommit={commitSection}
                suggestions={sectionSuggestions}
              />
            )}
            {documentRunnerRegistryId === null ? null : (
              <Tooltip content="Send to agent">
                <IconButton
                  aria-label="Send to agent"
                  icon="send"
                  onClick={() => void handleSendToAgent()}
                  type="button"
                  variant="secondary"
                />
              </Tooltip>
            )}
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
      {state.document === null ? null : (
        <div className="mt-1 flex flex-wrap items-center gap-2 pb-6">
          <DocumentAgentPills references={state.document.references} />
        </div>
      )}
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
