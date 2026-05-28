import { Icon } from '@two-pebble/components';
import type { KnownIdeKind } from '@two-pebble/realtime';
import type { ButtonHTMLAttributes } from 'react';

export interface IdeLogoProps {
  kind: KnownIdeKind;
  className?: string;
}

export function IdeLogo(props: IdeLogoProps) {
  switch (props.kind) {
    case 'cursor':
      return <CursorLogo className={props.className} />;
    case 'vscode':
      return <VsCodeLogo className={props.className} />;
    case 'zed':
      return <ZedLogo className={props.className} />;
    case 'other':
      return <Icon name="code" color="text-current" className={props.className} />;
  }
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

function VsCodeLogo(props: { className?: string }) {
  return (
    <svg aria-hidden="true" className={props.className} viewBox="0 0 100 100" fill="none">
      <path
        d="M96.461 10.796 75.857.876a6.248 6.248 0 0 0-7.107 1.208l-67.451 61.5a4.167 4.167 0 0 0 .004 6.161l5.51 5.009a4.167 4.167 0 0 0 5.321.237l81.227-61.621C96.086 11.302 100 13.246 100 16.667v-.239a6.25 6.25 0 0 0-3.539-5.632Z"
        fill="#0065A9"
      />
      <path
        d="m96.461 89.204-20.604 9.92a6.248 6.248 0 0 1-7.107-1.207l-67.451-61.5a4.167 4.167 0 0 1 .004-6.162l5.51-5.009a4.167 4.167 0 0 1 5.321-.236l81.227 61.62C96.086 88.698 100 86.754 100 83.333v.239a6.25 6.25 0 0 1-3.539 5.632Z"
        fill="#007ACC"
      />
      <path
        d="M75.858 99.126A6.25 6.25 0 0 1 68.75 97.917C71.056 100.223 75 98.59 75 95.328V4.672c0-3.262-3.944-4.895-6.25-2.589A6.25 6.25 0 0 1 75.858.874l20.601 9.907A6.25 6.25 0 0 1 100 16.413v67.174a6.25 6.25 0 0 1-3.541 5.633l-20.601 9.906Z"
        fill="#1F9CF0"
      />
      <path d="M75 27.299 45.109 50 75 72.701V27.299Z" fill="#45A9F4" />
    </svg>
  );
}

function ZedLogo(props: { className?: string }) {
  return (
    <svg aria-hidden="true" className={props.className} viewBox="0 0 32 32" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.931 1.954c-.539 0-.977.438-.977.977v21.498H0V2.931A2.931 2.931 0 0 1 2.931 0h26.181c1.306 0 1.96 1.579 1.036 2.502L14.024 18.627h4.542v-2.016h1.954v2.504c0 .81-.656 1.466-1.466 1.466h-6.985L8.71 23.94h15.23V11.726h1.954V23.94a1.954 1.954 0 0 1-1.954 1.954H6.756l-3.42 3.42h25.001c.54 0 .977-.437.977-.977V6.84h1.955v21.497a2.931 2.931 0 0 1-2.932 2.932H2.157c-1.306 0-1.96-1.579-1.037-2.502l16.064-16.064h-4.481v1.954h-1.954v-2.443c0-.809.656-1.465 1.465-1.465h6.924l3.42-3.42H7.329v12.214H5.374V7.329c0-1.08.875-1.955 1.954-1.955h17.184l3.421-3.42H2.931Z"
        fill="#1348DC"
      />
    </svg>
  );
}

function CursorLogo(props: { className?: string }) {
  return (
    <svg aria-hidden="true" className={props.className} viewBox="0 0 466.73 532.09" fill="none">
      <path
        className="fill-[#26251e] dark:fill-[#edecec]"
        d="M457.43 125.94 244.42 2.96c-6.84-3.95-15.28-3.95-22.12 0L9.3 125.94C3.55 129.26 0 135.4 0 142.05v247.99c0 6.65 3.55 12.79 9.3 16.11l213.01 122.98c6.84 3.95 15.28 3.95 22.12 0l213.01-122.98c5.75-3.32 9.3-9.46 9.3-16.11V142.05c0-6.65-3.55-12.79-9.3-16.11h-.01ZM444.05 151.99 238.42 508.15c-1.39 2.4-5.06 1.42-5.06-1.36V273.58c0-4.66-2.49-8.97-6.53-11.31L24.87 145.67c-2.4-1.39-1.42-5.06 1.36-5.06h411.26c5.84 0 9.49 6.33 6.57 11.39h-.01Z"
      />
    </svg>
  );
}
