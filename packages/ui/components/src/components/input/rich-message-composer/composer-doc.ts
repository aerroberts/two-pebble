import type { JSONContent } from '@tiptap/core';

/**
 * Empty composer document. Shared across surfaces so reset paths always
 * land on the same JSON shape and `useEditor` doesn't churn references.
 */
export function emptyComposerDoc(): JSONContent {
  return { type: 'doc', content: [{ type: 'paragraph' }] };
}

/**
 * True when the doc has no user-entered content (a single empty
 * paragraph, or no content at all).
 */
export function isComposerDocEmpty(doc: JSONContent): boolean {
  const content = doc.content ?? [];
  if (content.length === 0) {
    return true;
  }
  for (const node of content) {
    if (!isNodeEmpty(node)) {
      return false;
    }
  }
  return true;
}

function isNodeEmpty(node: JSONContent): boolean {
  if (node.type === 'documentMention') {
    return false;
  }
  if (node.type === 'text') {
    return (node.text ?? '').trim().length === 0;
  }
  if (node.type === 'codeBlock') {
    return (node.content ?? []).every((child) => (child.text ?? '').trim().length === 0);
  }
  const children = node.content ?? [];
  if (children.length === 0) {
    return true;
  }
  return children.every((child) => isNodeEmpty(child));
}

const DRAFT_VERSION = 1;
const DRAFT_TTL_MS = 1000 * 60 * 60 * 24 * 7;

interface StoredDraft {
  version: number;
  savedAt: number;
  doc: JSONContent;
}

/**
 * Persists composer docs to localStorage per surface so rich nodes
 * (document mentions, code blocks) survive page navigations. Old drafts
 * past TTL are silently discarded.
 */
export function loadComposerDraft(storageKey: string): JSONContent | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (raw === null) {
      return undefined;
    }
    const parsed = JSON.parse(raw) as StoredDraft;
    if (parsed.version !== DRAFT_VERSION) {
      return undefined;
    }
    if (Date.now() - parsed.savedAt > DRAFT_TTL_MS) {
      return undefined;
    }
    return parsed.doc;
  } catch {
    return undefined;
  }
}

export function saveComposerDraft(storageKey: string, doc: JSONContent): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const stored: StoredDraft = { version: DRAFT_VERSION, savedAt: Date.now(), doc };
    window.localStorage.setItem(storageKey, JSON.stringify(stored));
  } catch {
    // Storage quota or disabled cookies — drafts become session-only.
  }
}

export function clearComposerDraft(storageKey: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    // Ignore — clearing is best-effort.
  }
}
