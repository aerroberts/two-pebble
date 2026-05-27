'use client';

import { isValidElement, type ReactElement, type ReactNode } from 'react';
import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { HighlightedCode } from '../code-block/highlighted-code';

export interface MarkdownViewProps {
  content: string;
}

const LANGUAGE_CLASS_RE = /language-(\S+)/;

/**
 * Normalize fenced code-block language identifiers to the names Prism ships
 * with. `tsx` / `jsx` / `typescript` all have grammars in
 * `prism-react-renderer`, so users get JSX-aware highlighting by writing
 * ` ```tsx ` (and friends) in markdown.
 */
const LANGUAGE_ALIASES: Record<string, string> = {
  ts: 'typescript',
  js: 'javascript',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  yml: 'yaml',
  py: 'python',
  md: 'markdown',
  html: 'markup',
  xml: 'markup',
};

function resolveLanguage(className: string | undefined): string | null {
  if (className === undefined) {
    return null;
  }
  const match = LANGUAGE_CLASS_RE.exec(className);
  if (match === null) {
    return null;
  }
  const raw = match[1].toLowerCase();
  return LANGUAGE_ALIASES[raw] ?? raw;
}

function nodeToCodeString(node: ReactNode): string {
  if (typeof node === 'string') {
    return node;
  }
  if (typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(nodeToCodeString).join('');
  }
  if (isValidElement(node)) {
    const element = node as ReactElement<{ children?: ReactNode }>;
    return nodeToCodeString(element.props.children);
  }
  return '';
}

const COMPONENTS: Components = {
  h1: (props) => (
    <h1 className="text-lg font-semibold text-content border-b border-border pb-2 mb-3 mt-4 first:mt-0" {...props} />
  ),
  h2: (props) => <h2 className="text-base font-semibold text-content mt-6 mb-2 first:mt-0" {...props} />,
  h3: (props) => <h3 className="text-sm font-semibold text-content mt-4 mb-1.5 first:mt-0" {...props} />,
  p: (props) => <p className="text-content leading-relaxed mb-2 last:mb-0 break-words" {...props} />,
  ul: (props) => <ul className="list-disc pl-5 space-y-1 mb-2 last:mb-0 text-content" {...props} />,
  ol: (props) => <ol className="list-decimal pl-5 space-y-1 mb-2 last:mb-0 text-content" {...props} />,
  li: (props) => <li className="leading-relaxed" {...props} />,
  code: (codeProps) => {
    const language = resolveLanguage(codeProps.className);
    if (language === null) {
      return <code className="bg-surface-hover rounded-md px-1 py-0.5 font-mono text-content" {...codeProps} />;
    }
    // Fenced code block — defer rendering to the `pre` wrapper so we can apply
    // syntax highlighting and skip the default <pre><code> structure.
    return <code className={codeProps.className}>{codeProps.children}</code>;
  },
  pre: (preProps) => {
    const child = isValidElement(preProps.children)
      ? (preProps.children as ReactElement<{ className?: string; children?: ReactNode }>)
      : null;
    const language = child ? resolveLanguage(child.props.className) : null;
    if (child !== null && language !== null) {
      const code = nodeToCodeString(child.props.children).replace(/\n$/, '');
      return (
        <div className="my-2 overflow-hidden rounded-md border border-border bg-surface">
          <HighlightedCode code={code} language={language} />
        </div>
      );
    }
    return (
      <pre
        className="bg-surface rounded-md px-3 py-2 overflow-x-auto my-2 font-mono text-sm text-content [&>code]:bg-transparent [&>code]:p-0 [&>code]:rounded-none whitespace-pre-wrap break-words border border-border"
        {...preProps}
      />
    );
  },
  blockquote: (props) => (
    <blockquote
      className="border-l-4 border-accent pl-4 my-3 text-content-muted italic [&>p]:mb-2 [&>p:last-child]:mb-0"
      {...props}
    />
  ),
  a: (props) => (
    <a
      className="text-accent hover:underline underline-offset-2"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  img: (props) => (
    <img
      alt={props.alt ?? ''}
      className="my-3 max-h-96 max-w-full rounded-lg border border-border object-contain"
      {...props}
    />
  ),
  strong: (props) => <strong className="font-semibold text-content" {...props} />,
  em: (props) => <em className="italic text-content" {...props} />,
  hr: () => <hr className="border-0 border-t border-border my-4" />,
  table: (props) => (
    <div className="overflow-x-auto my-2 rounded-lg border border-border overflow-hidden">
      <table className="w-full border-collapse" {...props} />
    </div>
  ),
  thead: (props) => <thead className="bg-background" {...props} />,
  th: (props) => (
    <th className="px-3 py-2 text-left text-sm font-medium text-content-muted border-b border-border" {...props} />
  ),
  td: (props) => <td className="px-3 py-2 text-sm text-content border-b border-border" {...props} />,
};

export function MarkdownView(props: MarkdownViewProps) {
  return (
    <div className="w-full min-w-0 text-sm [&>*:first-child]:mt-0 overflow-hidden break-words space-y-2">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={COMPONENTS}>
        {props.content}
      </ReactMarkdown>
    </div>
  );
}
