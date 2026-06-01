import type { Editor } from '@tiptap/core';
import type { JSONContent } from '@two-pebble/components';
import { isDocumentUpdateConflictError, type TipTapDocument } from '@two-pebble/datatypes';
import { useDocument, useDocumentMutations } from '@two-pebble/realtime';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { projectPath, useProjectId } from '../../project-context';

const EMPTY_DOCUMENT: TipTapDocument = { type: 'doc', content: [] };
const AUTOSAVE_INTERVAL_MS = 2000;
const CONFLICT_MESSAGE =
  'This document changed elsewhere. Your latest edits were not saved so newer changes are not overwritten.';

export function useDocumentEditorPageState() {
  const params = useParams();
  const documentId = params.documentId ?? '';
  const navigate = useNavigate();
  const projectId = useProjectId();
  const documentLoadable = useDocument({ id: documentId });
  const document = documentLoadable?.value ?? null;
  const mutations = useDocumentMutations();
  const [nameDraft, setNameDraft] = useState('');
  const [error, setError] = useState('');

  // The content the editor has currently adopted, and the server revision it
  // was edited from. `lastSavedContentRef` dedupes redundant writes;
  // `baseRevisionRef` is the compare-and-swap token so a save cannot clobber a
  // newer revision written by another tab or an agent.
  const lastSavedContentRef = useRef('');
  const baseRevisionRef = useRef<number | null>(null);
  const loadedDocumentIdRef = useRef('');
  // The latest content typed but not yet persisted. Non-null means the user
  // has local edits in flight; the autosave loop flushes it.
  const pendingContentRef = useRef<JSONContent | null>(null);
  // Serializes every writer (autosave, blur, comment commands) into one
  // ordered chain so they cannot race on the shared baseline.
  const saveChainRef = useRef<Promise<void>>(Promise.resolve());
  // Keep the current row and the latest save closure in refs so the long-lived
  // autosave interval and the serialized chain always read current values
  // without being torn down and recreated on every render.
  const documentRef = useRef(document);
  documentRef.current = document;

  const editorContent = useMemo(() => parseDocumentContent(document?.content), [document?.content]);

  useEffect(() => {
    if (document === null) {
      return;
    }
    setNameDraft(document.name);
    const isNewDocument = loadedDocumentIdRef.current !== document.id;
    if (isNewDocument) {
      loadedDocumentIdRef.current = document.id;
      pendingContentRef.current = null;
      setError('');
    }
    // Adopt the server revision as the editing baseline only when idle: a newly
    // opened document, or an external update that arrives with no local edits
    // pending. While the user has unsaved edits, keep the prior baseline so a
    // server echo cannot dedupe their work away (the previous code re-baselined
    // on every echo, which silently dropped in-flight edits).
    if (isNewDocument || pendingContentRef.current === null) {
      lastSavedContentRef.current = JSON.stringify(editorContent);
      baseRevisionRef.current = document.updatedAt;
    }
  }, [document, editorContent]);

  const performSave = async (content: JSONContent) => {
    const current = documentRef.current;
    if (current === null) {
      return;
    }
    const serialized = JSON.stringify(content);
    if (serialized === lastSavedContentRef.current) {
      return;
    }
    try {
      const saved = await mutations.updateDocumentContent({
        id: current.id,
        content: serialized,
        expectedUpdatedAt: baseRevisionRef.current ?? undefined,
      });
      lastSavedContentRef.current = serialized;
      baseRevisionRef.current = saved.updatedAt;
      setError('');
    } catch (caughtError) {
      if (isDocumentUpdateConflictError(caughtError)) {
        // Another writer saved a newer revision. Leave it intact and surface
        // the conflict; the editor reconciles to the server content when it
        // next loses focus.
        setError(CONFLICT_MESSAGE);
        return;
      }
      setError(caughtError instanceof Error ? caughtError.message : 'Could not save document.');
    }
  };

  const saveContent = (content: JSONContent): Promise<void> => {
    const run = saveChainRef.current.then(() => performSave(content));
    // Swallow rejections on the chain itself so one failed save does not break
    // the queue; the caller still observes the original promise.
    saveChainRef.current = run.catch(() => {});
    return run;
  };

  const saveContentRef = useRef(saveContent);
  saveContentRef.current = saveContent;

  // Records locally-edited content from the editor's onUpdate without writing
  // immediately; the autosave loop coalesces to the latest value.
  const noteContentChange = (content: JSONContent) => {
    pendingContentRef.current = content;
  };

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const pending = pendingContentRef.current;
      if (pending === null) {
        return;
      }
      // Clear before saving so edits made during the in-flight write are kept
      // for the next tick instead of being dropped.
      pendingContentRef.current = null;
      void saveContentRef.current(pending);
    }, AUTOSAVE_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, []);

  const saveName = async () => {
    setError('');
    if (document === null) {
      return;
    }
    const nextName = nameDraft.trim();
    if (nextName.length === 0 || nextName === document.name) {
      return;
    }
    try {
      await mutations.renameDocument({ id: document.id, name: nextName });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not rename document.');
    }
  };

  const addComment = async (editor: Editor, cellId: string, body: string) => {
    editor.chain().focus().addComment({ cellId, body, authorId: 'human' }).run();
    await saveContent(editor.getJSON());
  };

  const closeComment = async (editor: Editor, cellId: string, closedReason: string) => {
    editor.chain().focus().closeCommentThread({ cellId, closedReason, authorId: 'human' }).run();
    await saveContent(editor.getJSON());
  };

  const deleteDocument = async () => {
    setError('');
    if (document === null) {
      return;
    }
    try {
      await mutations.deleteDocument({ id: document.id });
      navigate(projectPath(projectId, '/documents'));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not delete document.');
    }
  };

  const setSection = async (section: string | null) => {
    setError('');
    if (document === null) {
      return;
    }
    if (section === document.section) {
      return;
    }
    try {
      await mutations.setDocumentSection({ id: document.id, section });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not update section.');
    }
  };

  return {
    addComment,
    closeComment,
    deleteDocument,
    document,
    documentId,
    editorContent,
    error,
    nameDraft,
    noteContentChange,
    saveContent,
    saveName,
    setNameDraft,
    setSection,
  };
}

function parseDocumentContent(content: string | undefined): TipTapDocument {
  if (content === undefined) {
    return EMPTY_DOCUMENT;
  }
  try {
    const parsed = JSON.parse(content) as TipTapDocument;
    if (parsed.type === 'doc') {
      return parsed;
    }
  } catch {
    return EMPTY_DOCUMENT;
  }
  return EMPTY_DOCUMENT;
}
