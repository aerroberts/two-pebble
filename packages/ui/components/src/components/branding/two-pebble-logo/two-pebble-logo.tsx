import type { HTMLAttributes } from 'react';

export type TwoPebbleLogoSize = 'small' | 'large';

export interface TwoPebbleLogoProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Logo mark size. Defaults to the compact mark used in navigation. */
  size?: TwoPebbleLogoSize;
  /** When true, renders a wordmark next to the mark. Defaults to "Two Pebble" unless `text` is set. */
  withText?: boolean;
  /** Overrides the wordmark rendered when `withText` is true. */
  text?: string;
  /** Additional classes applied to the SVG. When provided, the default size class from `size` is dropped so the caller controls sizing/animation. */
  svgClassName?: string;
}

const logoSizeClassName: Record<TwoPebbleLogoSize, string> = {
  large: 'h-14 w-14',
  small: 'h-6 w-6',
};

export function TwoPebbleLogo(props: TwoPebbleLogoProps) {
  const { size = 'small', withText = false, text, className, svgClassName: svgClassNameOverride, ...rest } = props;
  const wordmark = text ?? 'Two Pebble';
  const gapClassName = withText ? 'gap-3' : 'gap-0';
  const containerClassName = `inline-flex items-center ${gapClassName} ${className ?? ''}`.trim();
  const sizeClassName = svgClassNameOverride ? '' : logoSizeClassName[size];
  const svgClassName = `${sizeClassName} shrink-0 fill-current text-content ${svgClassNameOverride ?? ''}`.trim();

  return (
    <div className={containerClassName} {...rest}>
      <svg aria-label={`${wordmark} logo`} className={svgClassName} role="img" viewBox="0 0 100 100">
        <path d="m90.2 66.7-1.7-7.9-0.4-2c-0.1-0.4-0.1-1.5-0.7-2.1l-3.2-2.9s-3.6-3.4-4.3-3.9c-0.7-0.6-4.3-2-5-2.3-0.4-0.1-8.7 0.4-16 0.9l7.3-2.6 1.1-1c0.2-0.2 1.9-2.2 3-3.1l1.6-1.4 5.2-4.4c1.1-0.9 6.6-11.6 7.3-13l5-7 2-9.7-1.2-3.1h-0.4l-9.2 1.4-8.7 4.2c-1.6 0.9-5.3 2.6-6.4 3.3-2.3 1.4-2.5 2.1-4.3 2.7-2 0.8-6.1 2.2-7.5 2.8l-9.1 5.2c-3.6 2-9.7 6-14.5 9.1l-6.8 10-1.9 4.6 3.4 3.4 10.1 3.3 7.8-0.2-13.6 4.4-16.5 7.8-7.2 8.6c-0.8 0.9-1.5 3.2-1.5 3.8 0 0.4 1.5 5.2 1.7 5.8 0.2 0.4 3 4.5 3.6 4.9l4 2.8 0.2 0.3 7.2 2.7c-10.8 0.5-19.2 1.5-19.2 2.9 0 2 21.3 3.9 48.2 3.9 27.1 0 49.3-1.4 49.3-3.9 0-1.3-8.4-2.4-26.4-3.3 3-0.8 7.3-2 7.9-2.3 0.8-0.4 8-6.5 9.4-7.8 0.7-0.6 0.7-1.1 2.1-5.8l0.5-1.6 0.3-3.7c0.2-0.8-2.1-1.9-2.5-3.8zm-62.2-22.6c-0.6 0.2-4.5 0-4.5 0 0.4-2 3.7-5.9 4.4-6.8l3.7-5.5 7.2-4.7c4.5-2.8 12.4-7.3 15.6-9.2 1.4-0.8 5.5-1.9 7.2-2.9 2.6-1.3 4.3-2.8 5.5-3.5l8-3.9 5.5-2.6c0.9-0.4 1.3-0.5 1.5-0.6l6-1.2s-3.5 4.9-4.6 5.8-7.5 4.6-8.1 5.4l-4.2 5.8c-1.6 2.4-2.2 3-3.7 4.6l-5.6 5.6-3.3 2.5-17 6.6-4.8 1-7.2 3.1-1.6 0.5zm45.2 10.3c-1.6 0.6-7.3 1.7-8.8 2.4-1.5 0.8-4.8 3.5-6.5 4.4-5 2.7-12.7 6.2-13.7 6.7-1.5 0.7-8.3 4.2-10.1 5.8-1.4 0.3-4.9 0.3-5.6 0.7-1.9 0.5-6.9 2-11.5 3.7l-8.7-0.6-2.7-1.9 8.3-10.5c0.2-0.4 15-7 16-7.4l0.1-0.1 9.9-0.5c6.6-0.3 12.7-1.4 18.7-3.1 4.1-1.2 6-1.6 8.1-2.9 1.5-0.9 4-2.7 4-2.7l0.4-0.5h3.4c0.9 0 3.2 1.1 3.2 1.3l0.2 0.1s-3.5 4.1-4.2 4.6l-0.5 0.5z" />
      </svg>
      {withText ? <span className="font-semibold capitalize tracking-tight text-content">{wordmark}</span> : null}
    </div>
  );
}
