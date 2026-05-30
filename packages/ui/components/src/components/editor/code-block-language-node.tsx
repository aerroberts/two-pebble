import { CodeBlock } from '@tiptap/extension-code-block';
import type { Node as PMNode } from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import type { NodeViewProps } from '@tiptap/react';
import { NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { Prism } from 'prism-react-renderer';
import { useMemo } from 'react';
import { MermaidDiagram } from '../code/mermaid/mermaid-diagram';
import { Select, type SelectOption } from '../input/select/select';

export type CodeBlockLanguage =
  | 'bash'
  | 'css'
  | 'html'
  | 'javascript'
  | 'json'
  | 'markdown'
  | 'mermaid'
  | 'python'
  | 'sql'
  | 'text'
  | 'tsx'
  | 'typescript'
  | 'yaml';

const LANGUAGE_OPTIONS: SelectOption[] = [
  { value: 'typescript', label: 'TypeScript' },
  { value: 'tsx', label: 'TSX' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'json', label: 'JSON' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'mermaid', label: 'Mermaid' },
  { value: 'bash', label: 'Bash' },
  { value: 'python', label: 'Python' },
  { value: 'css', label: 'CSS' },
  { value: 'html', label: 'HTML' },
  { value: 'sql', label: 'SQL' },
  { value: 'yaml', label: 'YAML' },
  { value: 'text', label: 'Text' },
];

const LANGUAGE_ALIASES: Record<string, CodeBlockLanguage> = {
  html: 'html',
  js: 'javascript',
  md: 'markdown',
  plaintext: 'text',
  shell: 'bash',
  sh: 'bash',
  ts: 'typescript',
  yml: 'yaml',
  zsh: 'bash',
};

const VALID_LANGUAGES = new Set<CodeBlockLanguage>([
  'bash',
  'css',
  'html',
  'javascript',
  'json',
  'markdown',
  'mermaid',
  'python',
  'sql',
  'text',
  'tsx',
  'typescript',
  'yaml',
]);

/**
 * Map the persisted language to a Prism grammar. Mermaid has no Prism grammar
 * of its own, so we fall back to markdown which keeps the source readable
 * without misleading colours.
 */
const PRISM_GRAMMAR_NAME: Record<CodeBlockLanguage, string> = {
  bash: 'bash',
  css: 'css',
  html: 'markup',
  javascript: 'javascript',
  json: 'json',
  markdown: 'markdown',
  mermaid: 'markdown',
  python: 'python',
  sql: 'sql',
  text: 'text',
  tsx: 'tsx',
  typescript: 'javascript',
  yaml: 'yaml',
};

function normalizeLanguage(value: unknown): CodeBlockLanguage {
  if (typeof value !== 'string') {
    return 'text';
  }
  const normalized = value.trim().toLowerCase();
  const aliased = LANGUAGE_ALIASES[normalized] ?? normalized;
  if (VALID_LANGUAGES.has(aliased as CodeBlockLanguage)) {
    return aliased as CodeBlockLanguage;
  }
  return 'text';
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
      defaultLanguage: 'text',
      languageClassPrefix: 'language-',
    };
  },

  addAttributes() {
    return {
      language: {
        default: 'text' as CodeBlockLanguage,
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
  const mermaidSource = language === 'mermaid' ? props.node.textContent : '';

  return (
    <NodeViewWrapper
      as="div"
      className="document-code-block my-4 overflow-hidden rounded-md border border-border-strong bg-surface-alt"
      data-language={language}
    >
      <div
        className="flex items-center justify-between border-b border-border bg-surface px-2 py-1.5"
        contentEditable={false}
      >
        <Select
          options={LANGUAGE_OPTIONS}
          value={language}
          variant="borderless"
          onChange={(next) => props.updateAttributes({ language: normalizeLanguage(next) })}
        />
      </div>
      <pre className="m-0 overflow-auto bg-transparent px-4 py-3 text-xs leading-[1.7]" spellCheck={false}>
        <NodeViewContent
          as="code"
          className={`language-${language} block min-w-0 rounded-none !bg-transparent p-0 !px-0 font-mono`}
          spellCheck="false"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </pre>
      {language === 'mermaid' ? (
        <div className="border-t border-border" contentEditable={false}>
          <MermaidDiagram code={mermaidSource} framed={false} />
        </div>
      ) : null}
    </NodeViewWrapper>
  );
}
