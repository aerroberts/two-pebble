import { CodeBlock } from '@tiptap/extension-code-block';
import type { Node as PMNode } from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import type { NodeViewProps } from '@tiptap/react';
import { NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { Prism } from 'prism-react-renderer';
import { useMemo } from 'react';
import { Select, type SelectOption } from '../input/select/select';

export type CodeBlockLanguage = 'json' | 'typescript' | 'markdown';

const LANGUAGE_OPTIONS: SelectOption[] = [
  { value: 'typescript', label: 'TypeScript' },
  { value: 'json', label: 'JSON' },
  { value: 'markdown', label: 'Markdown' },
];

const VALID_LANGUAGES = new Set<CodeBlockLanguage>(['json', 'typescript', 'markdown']);

/**
 * Map the user-facing language to a Prism grammar. `prism-react-renderer`
 * ships json + markdown + javascript by default but not typescript, so we
 * use the javascript grammar as a close-enough fallback for TS.
 */
const PRISM_GRAMMAR_NAME: Record<CodeBlockLanguage, string> = {
  json: 'json',
  typescript: 'javascript',
  markdown: 'markdown',
};

function normalizeLanguage(value: unknown): CodeBlockLanguage {
  if (typeof value === 'string' && VALID_LANGUAGES.has(value as CodeBlockLanguage)) {
    return value as CodeBlockLanguage;
  }
  return 'typescript';
}

/**
 * Document code block with an inline language picker (JSON / TypeScript /
 * Markdown) and Prism-driven syntax highlighting. Replaces the StarterKit
 * default `codeBlock` so the editor can persist a typed language attribute
 * and so users have a visible language selector for each block.
 */
export const CodeBlockLanguageNode = CodeBlock.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      defaultLanguage: 'typescript',
      languageClassPrefix: 'language-',
    };
  },

  addAttributes() {
    return {
      language: {
        default: 'typescript' as CodeBlockLanguage,
        parseHTML: (element) => {
          const codeEl = element.firstElementChild;
          const classList = codeEl ? Array.from(codeEl.classList) : [];
          const langClass = classList.find((cls) => cls.startsWith('language-'));
          const raw = langClass?.replace('language-', '');
          return normalizeLanguage(raw);
        },
        renderHTML: (attributes) => ({
          'data-language': normalizeLanguage(attributes.language),
        }),
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockNodeView);
  },

  addProseMirrorPlugins() {
    return [...(this.parent?.() ?? []), prismHighlightPlugin()];
  },
});

interface PrismToken {
  type?: string;
  alias?: string | string[];
  content?: unknown;
  length?: number;
}

function isToken(value: unknown): value is PrismToken {
  return typeof value === 'object' && value !== null && 'type' in (value as Record<string, unknown>);
}

function tokenTypes(token: PrismToken): string[] {
  const types: string[] = [];
  if (typeof token.type === 'string') {
    types.push(token.type);
  }
  if (typeof token.alias === 'string') {
    types.push(token.alias);
  } else if (Array.isArray(token.alias)) {
    types.push(...token.alias);
  }
  return types;
}

function emitDecorations(
  tokens: Array<PrismToken | string>,
  start: number,
  inherited: string[],
  out: Decoration[],
): number {
  let cursor = start;
  for (const token of tokens) {
    if (typeof token === 'string') {
      cursor += token.length;
      continue;
    }
    if (!isToken(token)) {
      continue;
    }
    const types = [...inherited, ...tokenTypes(token)];
    const className = types.map((type) => `prism-token prism-token-${type}`).join(' ');
    if (Array.isArray(token.content)) {
      const inner = token.content as Array<PrismToken | string>;
      const innerStart = cursor;
      cursor = emitDecorations(inner, cursor, types, out);
      if (cursor > innerStart && className.length > 0) {
        out.push(Decoration.inline(innerStart, cursor, { class: className }));
      }
      continue;
    }
    const text = typeof token.content === 'string' ? token.content : '';
    const tokenLength = text.length;
    if (tokenLength > 0 && className.length > 0) {
      out.push(Decoration.inline(cursor, cursor + tokenLength, { class: className }));
    }
    cursor += tokenLength;
  }
  return cursor;
}

function getCodeBlockDecorations(doc: PMNode, name: string): DecorationSet {
  const decorations: Decoration[] = [];
  doc.descendants((node, pos) => {
    if (node.type.name !== name) {
      return undefined;
    }
    const language = normalizeLanguage(node.attrs.language);
    const grammarName = PRISM_GRAMMAR_NAME[language];
    const grammar = (Prism.languages as Record<string, unknown>)[grammarName];
    if (grammar === undefined || grammar === null) {
      return undefined;
    }
    const text = node.textContent;
    if (text.length === 0) {
      return undefined;
    }
    const tokens = Prism.tokenize(text, grammar as Prism.Grammar) as Array<PrismToken | string>;
    emitDecorations(tokens, pos + 1, [], decorations);
    return undefined;
  });
  return DecorationSet.create(doc, decorations);
}

function prismHighlightPlugin() {
  const key = new PluginKey<DecorationSet>('codeBlockPrismHighlight');
  return new Plugin<DecorationSet>({
    key,
    state: {
      init(_config, instance) {
        return getCodeBlockDecorations(instance.doc, 'codeBlock');
      },
      apply(tr, value, _oldState, newState) {
        if (!tr.docChanged) {
          return value.map(tr.mapping, tr.doc);
        }
        return getCodeBlockDecorations(newState.doc, 'codeBlock');
      },
    },
    props: {
      decorations(state) {
        return key.getState(state);
      },
    },
  });
}

function CodeBlockNodeView(props: NodeViewProps) {
  const language = useMemo(() => normalizeLanguage(props.node.attrs.language), [props.node.attrs.language]);

  return (
    <NodeViewWrapper
      as="div"
      className="my-2 overflow-hidden rounded-md border border-border bg-surface"
      data-language={language}
    >
      <div
        className="flex items-center justify-between border-b border-border bg-surface px-2 py-1"
        contentEditable={false}
      >
        <Select
          options={LANGUAGE_OPTIONS}
          value={language}
          variant="borderless"
          onChange={(next) => props.updateAttributes({ language: normalizeLanguage(next) })}
        />
      </div>
      <pre className="m-0 overflow-auto bg-transparent px-3 py-2 text-xs leading-relaxed" spellCheck={false}>
        <NodeViewContent
          as="code"
          className={`language-${language} font-mono`}
          spellCheck="false"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </pre>
    </NodeViewWrapper>
  );
}
