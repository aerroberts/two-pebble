'use client';

import { Highlight, themes } from 'prism-react-renderer';
import { useSyncExternalStore } from 'react';

import { getIsDark, subscribeToTheme } from './theme-observer';

interface HighlightedCodeProps {
  code: string;
  language: string;
  indentWrappedLines?: boolean;
  lineNumbers?: boolean;
  // When true, drops the outer padding and tightens font size + line height. Used by dense
  // contexts (e.g. trace cells) that want the code flush with their container.
  compact?: boolean;
}

export function HighlightedCode(props: HighlightedCodeProps) {
  const isDark = useSyncExternalStore(subscribeToTheme, getIsDark, () => false);
  const theme = isDark ? themes.vsDark : themes.github;
  const preClassName = props.compact
    ? 'w-full min-w-0 p-0 text-[11px] font-mono leading-snug !bg-transparent whitespace-pre-wrap break-words'
    : 'w-full min-w-0 px-3 py-2 text-xs font-mono leading-relaxed !bg-transparent whitespace-pre-wrap break-words';

  return (
    <Highlight theme={theme} code={props.code} language={props.language}>
      {(highlight) => {
        const lines = highlight.tokens.map((line, lineIndex) => {
          const tokens = line.map((token, tokenIndex) => (
            <span key={`${String(lineIndex)}-${String(tokenIndex)}`} {...highlight.getTokenProps({ token })} />
          ));
          const lineProps = highlight.getLineProps({ line });

          if (props.lineNumbers) {
            return (
              <div
                key={String(lineIndex)}
                {...lineProps}
                className={`${lineProps.className ?? ''} grid grid-cols-[1.35rem_minmax(0,1fr)] gap-1.5`.trim()}
              >
                <span className="select-none text-right font-mono text-content-subtle tabular-nums">
                  {lineIndex + 1}
                </span>
                <span className={props.indentWrappedLines ? 'min-w-0 pl-6 -indent-6' : 'min-w-0'}>{tokens}</span>
              </div>
            );
          }

          return (
            <div
              key={String(lineIndex)}
              {...lineProps}
              className={props.indentWrappedLines ? 'pl-6 -indent-6' : undefined}
            >
              {tokens}
            </div>
          );
        });

        return <pre className={preClassName}>{lines}</pre>;
      }}
    </Highlight>
  );
}
