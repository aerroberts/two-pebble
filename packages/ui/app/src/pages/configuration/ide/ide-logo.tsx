import { Icon, ProviderLogo } from '@two-pebble/components';
import type { KnownIdeKind } from '@two-pebble/realtime';
import type { ButtonHTMLAttributes } from 'react';

export interface IdeLogoProps {
  kind: KnownIdeKind;
  className?: string;
}

/**
 * Renders the editor's brand logo. The `cursor`/`vscode`/`zed` marks reuse
 * the shared provider logos (real brand art) rather than hand-rolled SVGs;
 * the `other` fallback keeps the generic code glyph.
 */
export function IdeLogo(props: IdeLogoProps) {
  if (props.kind === 'other') {
    return <Icon name="code" color="text-current" className={props.className} />;
  }
  return <ProviderLogo provider={props.kind} className={props.className} />;
}

export interface IdeLogoButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  kind: KnownIdeKind;
}

export function IdeLogoButton(props: IdeLogoButtonProps) {
  const { kind, className, type = 'button', disabled, ...rest } = props;
  const classes =
    `inline-flex h-7 w-7 items-center justify-center rounded-md bg-transparent text-content transition-[background-color,color,transform,opacity] duration-150 ease-out hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-55 enabled:cursor-pointer enabled:active:scale-95 ${className ?? ''}`.trim();

  return (
    <button className={classes} disabled={disabled} type={type} {...rest}>
      <IdeLogo kind={kind} className="h-4 w-4" />
    </button>
  );
}
