'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

import { Tooltip } from '../../providers/tooltip/tooltip-trigger';
import { HighlightedCode } from './highlighted-code';
import { inferLanguage } from './infer-language';

export interface CodeBlockProps {
  content: string;
  indentWrappedLines?: boolean;
  lineNumbers?: boolean;
  output?: string;
  outputLanguage?: string;
  outputLineNumbers?: boolean;
  title?: string;
  language?: string;
}

export function CodeBlock(props: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const lang = props.language ?? inferLanguage(props.title);

  const handleCopy = async () => {
    const copyContent = props.output === undefined ? props.content : `${props.content}\n${props.output}`;
    await navigator.clipboard.writeText(copyContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-md border border-border bg-surface">
      {props.title ? (
        <div className="flex items-center justify-between bg-surface px-3 py-1.5">
          <span className="truncate font-mono text-xs text-content-muted">{props.title}</span>
          <Tooltip content="Copy">
            <button type="button" onClick={handleCopy} className="flex shrink-0 items-center cursor-pointer">
              {copied ? (
                <Check className="w-3.5 h-3.5 text-accent transition-colors" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-content-muted hover:text-content cursor-pointer transition-colors" />
              )}
            </button>
          </Tooltip>
        </div>
      ) : null}
      <HighlightedCode
        code={props.content}
        language={lang}
        indentWrappedLines={props.indentWrappedLines}
        lineNumbers={props.lineNumbers}
      />
      {props.output !== undefined ? (
        <div className="border-t border-border/60">
          <HighlightedCode
            code={props.output}
            language={props.outputLanguage ?? 'text'}
            indentWrappedLines={props.indentWrappedLines}
            lineNumbers={props.outputLineNumbers ?? props.lineNumbers}
          />
        </div>
      ) : null}
    </div>
  );
}
