'use client';

import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface CopyableValueProps {
  value: string;
}

export function CopyableValue(props: CopyableValueProps) {
  const { value } = props;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return undefined;
    }

    const timeout = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timeout);
  }, [copied]);

  return (
    <button
      className="group -mx-1 inline-flex items-center gap-2 rounded-sm px-1 text-left text-sm leading-6 text-content transition-colors hover:bg-accent/[0.08] hover:text-accent"
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
        } catch {
          setCopied(false);
        }
      }}
    >
      <span>{value}</span>
      <span className={copied ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}>
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </span>
    </button>
  );
}
