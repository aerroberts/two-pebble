import type { ReactElement, ReactNode } from 'react';

import reactElementToJSXString from 'react-element-to-jsx-string';

import { CodeBlock } from './code-block';

export interface SyntaxExampleProps {
  children: ReactNode;
}

export function SyntaxExample(props: SyntaxExampleProps) {
  const code = reactElementToJSXString(props.children as ReactElement, {
    showDefaultProps: false,
    showFunctions: true,
    sortProps: false,
  });

  return (
    <div className="flex w-full min-h-[200px] border-b border-border">
      <div className="w-1/2 bg-surface-alt overflow-auto border-r border-border">
        <CodeBlock code={code} />
      </div>
      <div className="w-1/2 bg-background flex items-start justify-start p-4">{props.children}</div>
    </div>
  );
}
