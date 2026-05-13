import { Stone } from 'lucide-react';
import type { HTMLAttributes } from 'react';

export interface TwoPebbleLogoProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** When true, renders a wordmark next to the mark. Defaults to "Two Pebble" unless `text` is set. */
  withText?: boolean;
  /** Overrides the wordmark rendered when `withText` is true. */
  text?: string;
}

export function TwoPebbleLogo(props: TwoPebbleLogoProps) {
  const { withText = false, text, className, ...rest } = props;
  const wordmark = text ?? 'Two Pebble';
  const containerClassName = `inline-flex items-center gap-2 ${className ?? ''}`.trim();

  return (
    <div aria-label={wordmark} className={containerClassName} {...rest}>
      <div aria-hidden className="relative inline-flex h-9 w-12 items-end justify-center">
        <Stone className="-translate-x-1.5 -rotate-12 absolute bottom-0 h-7 w-7 text-content-muted" />
        <Stone className="absolute bottom-0 h-9 w-9 translate-x-1.5 rotate-6 text-content" />
      </div>
      {withText ? <span className="font-semibold tracking-tight text-content">{wordmark}</span> : null}
    </div>
  );
}
