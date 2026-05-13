import type { ReactNode } from 'react';

export interface ModalActionsProps {
  align?: 'left' | 'right';
  children: ReactNode;
}

export function ModalActions(props: ModalActionsProps) {
  const alignmentClass = props.align === 'left' ? 'justify-start' : 'justify-end';
  return <div className={`flex ${alignmentClass} gap-2 pt-2`}>{props.children}</div>;
}
