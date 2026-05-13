import { Highlight, themes } from 'prism-react-renderer';
import { useSyncExternalStore } from 'react';

import { CodeLines } from './code-lines';
import { getIsDark, subscribeToTheme } from './theme-observer';

export interface CodeBlockProps {
  code: string;
}

export function CodeBlock(props: CodeBlockProps) {
  const isDark = useSyncExternalStore(subscribeToTheme, getIsDark, () => false);
  const theme = isDark ? themes.vsDark : themes.github;

  return (
    <Highlight theme={theme} code={props.code.trim()} language="tsx">
      {(highlight) => <CodeLines {...highlight} />}
    </Highlight>
  );
}
