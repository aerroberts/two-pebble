import type { Editor } from '@tiptap/core';
import type { JSONContent } from '@two-pebble/components';
import {
  AutocompleteInput,
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
import { useDocuments, useLaunchAgent, useProjects, useTaskBoards } from '@two-pebble/realtime';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Navigate, useNavigate } from 'react-router-dom';
import { useProjectId } from '../../project-context';
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
  const projectId = useProjectId();
  const [editor, setEditor] = useState<Editor | null>(null);
  const [slashTrigger, setSlashTrigger] = useState<SlashTrigger | null>(null);
  const [activeCell, setActiveCell] = useState<ActiveCell | null>(null);
  const latestUnsavedContentRef = useRef<JSONContent | null>(null);
  const autosaveInFlightRef = useRef(false);
  const autosaveDocumentIdRef = useRef(state.documentId);
  const saveContentRef = useRef(state.saveContent);
  const documents = useDocuments({ projectId });
  const boards = useTaskBoards({ projectId });
  const projects = useProjects();
  const launchAgent = useLaunchAgent();
  const navigate = useNavigate();
  const { toast } = useToast();
  const documentRunnerRegistryId = projects.getItem(projectId)?.value?.documentRunnerAgentRegistryId ?? null;

  useEffect(() => {
    saveContentRef.current = state.saveContent;
  }, [state.saveContent]);

  useEffect(() => {
    if (autosaveDocumentIdRef.current === state.documentId) {
      return;
    }
    autosaveDocumentIdRef.current = state.documentId;
    latestUnsavedContentRef.current = null;
    autosaveInFlightRef.current = false;
  }, [state.documentId]);

  useEffect(() => {
    if (state.document === null) {
      return undefined;
    }
    const intervalId = window.setInterval(() => {
      if (autosaveInFlightRef.current || latestUnsavedContentRef.current === null) {
        return;
      }
      const content = latestUnsavedContentRef.current;
      latestUnsavedContentRef.current = null;
      autosaveInFlightRef.current = true;
      void saveContentRef.current(content).finally(() => {
        autosaveInFlightRef.current = false;
      });
    }, 2000);
    return () => window.clearInterval(intervalId);
  }, [state.document]);

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
  const [sectionDraft, setSectionDraft] = useState(currentSection);
  const [sectionOpen, setSectionOpen] = useState(false);
  const [sectionAnchor, setSectionAnchor] = useState<DOMRect | null>(null);
  const sectionButtonRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setSectionDraft(currentSection);
  }, [currentSection]);

  const commitSection = useCallback(
    (next: string) => {
      const trimmed = next.trim();
      if (trimmed.length === 0) {
        setSectionDraft('');
        void state.setSection(null);
      } else {
        setSectionDraft(trimmed);
        void state.setSection(trimmed);
      }
      setSectionOpen(false);
    },
    [state],
  );

  const handleSectionBlur = useCallback(() => {
    commitSection(sectionDraft);
  }, [commitSection, sectionDraft]);

  const openSectionPopover = useCallback(() => {
    if (sectionOpen) {
      setSectionOpen(false);
      return;
    }
    const el = sectionButtonRef.current;
    if (el === null) {
      return;
    }
    setSectionAnchor(el.getBoundingClientRect());
    setSectionOpen(true);
  }, [sectionOpen]);

  useEffect(() => {
    if (!sectionOpen) {
      return undefined;
    }
    const onScrollOrResize = () => {
      const el = sectionButtonRef.current;
      if (el !== null) {
        setSectionAnchor(el.getBoundingClientRect());
      }
    };
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [sectionOpen]);

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

  const openCommentForSelection = useCallback(() => {
    if (editor === null) {
      return;
    }
    const { $from } = editor.state.selection;
    let cellId = '';
    for (let depth = $from.depth; depth >= 0; depth -= 1) {
      const node = $from.node(depth);
      const id = typeof node.attrs.cellId === 'string' ? node.attrs.cellId : '';
      if (id.length > 0) {
        cellId = id;
        break;
      }
    }
    if (cellId.length === 0) {
      toast('Place your cursor in a block to comment.', 'error');
      return;
    }
    const cellElement = editor.view.dom.querySelector(`[data-cell-id="${cellId}"]`);
    if (!(cellElement instanceof HTMLElement)) {
      return;
    }
    setActiveCell({ cellId, anchor: cellElement });
  }, [editor, toast]);

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
    <PageLayout width="thin">
      <Header
        compact
        actionItems={
          <>
            {state.document === null ? null : (
              <span ref={sectionButtonRef} className="inline-flex">
                <Tooltip content={currentSection.length > 0 ? `Section: ${currentSection}` : 'Set section'}>
                  <IconButton
                    aria-label="Set document section"
                    icon="folder"
                    onClick={openSectionPopover}
                    type="button"
                    variant={currentSection.length > 0 ? 'primary' : 'secondary'}
                  />
                </Tooltip>
              </span>
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
            <Tooltip content="Comment">
              <IconButton
                aria-label="Comment on current block"
                icon="messages-square"
                onClick={openCommentForSelection}
                type="button"
                variant="secondary"
              />
            </Tooltip>
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
      {state.document !== null && state.document.references.length > 0 ? (
        <div className="mt-1 flex flex-wrap items-center gap-2 pb-6">
          <DocumentAgentPills references={state.document.references} />
        </div>
      ) : null}
      {sectionOpen && sectionAnchor !== null
        ? createPortal(
            <div
              className="fixed z-[1100] w-[240px] rounded-md border border-border bg-surface-raised p-2 shadow-modal"
              style={{
                top: sectionAnchor.bottom + 6,
                left: Math.max(8, Math.min(sectionAnchor.right - 240, window.innerWidth - 248)),
              }}
            >
              <AutocompleteInput
                ariaLabel="Document section"
                autoFocus
                leadingIcon="folder"
                onBlur={handleSectionBlur}
                onChange={setSectionDraft}
                onCommit={commitSection}
                placeholder="No section"
                suggestions={sectionSuggestions}
                value={sectionDraft}
              />
            </div>,
            document.body,
          )
        : null}
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
            onUpdate={(content) => {
              latestUnsavedContentRef.current = content;
            }}
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
