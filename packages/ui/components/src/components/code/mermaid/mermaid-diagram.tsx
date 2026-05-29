'use client';

import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';

import { getIsDark, subscribeToTheme } from '../code-block/theme-observer';

export interface MermaidDiagramProps {
  /** Raw Mermaid source (the body of a fenced ` ```mermaid ` block). */
  code: string;
  /** Whether the diagram should draw its own surrounding frame. */
  framed?: boolean;
}

type MermaidModule = typeof import('mermaid').default;

// `mermaid` is heavy (~hundreds of KB) and only ever runs in the browser. We
// share a single lazy import across diagrams so every Mermaid block on a page
// reuses the same library instance and only pays the load cost once.
let mermaidModulePromise: Promise<MermaidModule> | null = null;
let mermaidInitializedTheme: 'dark' | 'default' | null = null;

async function loadMermaid(): Promise<MermaidModule> {
  if (mermaidModulePromise === null) {
    mermaidModulePromise = import('mermaid').then((mod) => mod.default);
  }
  return mermaidModulePromise;
}

async function ensureMermaidInitialized(mermaid: MermaidModule, isDark: boolean): Promise<void> {
  const desired: 'dark' | 'default' = isDark ? 'dark' : 'default';
  if (mermaidInitializedTheme === desired) {
    return;
  }
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: desired,
    fontFamily: 'inherit',
  });
  mermaidInitializedTheme = desired;
}

interface RenderState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  svg: string;
  error: string;
}

const INITIAL_STATE: RenderState = { status: 'idle', svg: '', error: '' };

/**
 * Renders a Mermaid diagram from raw source. Used by both the Markdown
 * renderer and the TipTap code-block node so a ` ```mermaid ` block becomes a
 * visual diagram everywhere we render documents.
 *
 * Loads the `mermaid` package lazily and re-renders on theme changes so the
 * diagram matches the surrounding UI.
 */
export function MermaidDiagram(props: MermaidDiagramProps) {
  const framed = props.framed ?? true;
  const isDark = useSyncExternalStore(subscribeToTheme, getIsDark, () => false);
  const reactId = useId();
  // Mermaid uses the diagram id as a DOM id and requires it to be a valid CSS
  // selector. React's useId emits `:r0:` style values, so we sanitize.
  const diagramId = `mermaid-${reactId.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
  const [state, setState] = useState<RenderState>(INITIAL_STATE);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const trimmed = props.code.trim();
    if (trimmed.length === 0) {
      setState({ status: 'ready', svg: '', error: '' });
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setState((previous) => ({ ...previous, status: 'loading' }));

    let cancelled = false;
    void (async () => {
      try {
        const mermaid = await loadMermaid();
        await ensureMermaidInitialized(mermaid, isDark);
        const { svg } = await mermaid.render(diagramId, trimmed);
        if (cancelled || requestIdRef.current !== requestId) {
          return;
        }
        setState({ status: 'ready', svg, error: '' });
      } catch (error) {
        if (cancelled || requestIdRef.current !== requestId) {
          return;
        }
        const message = error instanceof Error ? error.message : 'Failed to render Mermaid diagram';
        setState({ status: 'error', svg: '', error: message });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [props.code, isDark, diagramId]);

  if (state.status === 'error') {
    const errorClassName = framed
      ? 'my-2 overflow-hidden rounded-md border border-border bg-surface'
      : 'overflow-hidden bg-surface';
    return (
      <div className={errorClassName}>
        <div className="border-b border-border bg-surface px-3 py-1 text-xs font-medium text-content-muted">
          Mermaid
        </div>
        <div className="px-3 py-2 text-xs text-content-muted">
          <div className="mb-2 text-content">Failed to render diagram: {state.error}</div>
          <pre className="overflow-auto whitespace-pre-wrap break-words font-mono text-[11px]">{props.code}</pre>
        </div>
      </div>
    );
  }

  if (state.status !== 'ready' || state.svg.length === 0) {
    const loadingClassName = framed
      ? 'my-2 overflow-hidden rounded-md border border-border bg-surface px-3 py-2 text-xs text-content-muted'
      : 'overflow-hidden bg-surface px-3 py-2 text-xs text-content-muted';
    return <div className={loadingClassName}>Rendering Mermaid diagram…</div>;
  }

  const diagramClassName = framed
    ? 'my-2 flex justify-center overflow-auto rounded-md border border-border bg-surface px-3 py-2 [&_svg]:max-w-full [&_svg]:h-auto'
    : 'flex justify-center overflow-auto bg-surface px-3 py-2 [&_svg]:max-w-full [&_svg]:h-auto';

  return (
    <div
      className={diagramClassName}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Mermaid is configured with securityLevel 'strict', which sanitizes the produced SVG.
      dangerouslySetInnerHTML={{ __html: state.svg }}
    />
  );
}
