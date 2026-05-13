import type { ReactNode } from 'react';

export interface ModalBodyProps {
  children: ReactNode;
}

export function ModalBody(props: ModalBodyProps) {
  return <div className="flex flex-col gap-3 p-4">{props.children}</div>;
}
