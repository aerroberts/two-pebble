import type { JSONContent } from '@two-pebble/components';
import { useDocument, useDocumentMutations } from '@two-pebble/realtime';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const EMPTY_DOCUMENT: JSONContent = { type: 'doc', content: [] };

export function useDocumentEditorPageState() {
  const params = useParams();
  const documentId = params.documentId ?? '';
  const navigate = useNavigate();
  const documentLoadable = useDocument({ id: documentId });
  const document = documentLoadable?.value ?? null;
  const mutations = useDocumentMutations();
  const [nameDraft, setNameDraft] = useState('');
  const [error, setError] = useState('');
  const lastSavedContentRef = useRef('');

  const editorContent = useMemo(() => parseDocumentContent(document?.content), [document?.content]);

  useEffect(() => {
    if (document === null) {
      return;
    }
    setNameDraft(document.name);
    lastSavedContentRef.current = JSON.stringify(editorContent);
  }, [document, editorContent]);

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

  const saveContent = async (content: JSONContent) => {
    setError('');
    if (document === null) {
      return;
    }
    const serialized = JSON.stringify(content);
    if (serialized === lastSavedContentRef.current) {
      return;
    }
    try {
      await mutations.updateDocumentContent({ id: document.id, content: serialized });
      lastSavedContentRef.current = serialized;
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not save document.');
    }
  };

  const deleteDocument = async () => {
    setError('');
    if (document === null) {
      return;
    }
    try {
      await mutations.deleteDocument({ id: document.id });
      navigate('/documents');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Could not delete document.');
    }
  };

  return {
    deleteDocument,
    document,
    documentId,
    editorContent,
    error,
    nameDraft,
    saveContent,
    saveName,
    setNameDraft,
  };
}

function parseDocumentContent(content: string | undefined): JSONContent {
  if (content === undefined) {
    return EMPTY_DOCUMENT;
  }
  try {
    const parsed = JSON.parse(content) as JSONContent;
    if (parsed.type === 'doc') {
      return parsed;
    }
  } catch {
    return EMPTY_DOCUMENT;
  }
  return EMPTY_DOCUMENT;
}
