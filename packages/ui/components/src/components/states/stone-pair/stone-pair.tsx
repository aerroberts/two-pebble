import { Stone } from 'lucide-react';
import type { HTMLAttributes } from 'react';

export type StonePairProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'>;

export function StonePair(props: StonePairProps) {
  return (
    <div aria-hidden className="relative inline-flex h-11 w-16 items-end justify-center" {...props}>
      <Stone className="-translate-x-2 -rotate-12 absolute bottom-0 h-9 w-9 text-content-muted" />
      <Stone className="absolute bottom-0 h-11 w-11 translate-x-2 rotate-6 text-content" />
    </div>
  );
}
