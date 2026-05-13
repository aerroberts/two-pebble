import type { ReactNode } from 'react';

export interface WorkbenchHeaderProps {
  leftAccessory?: ReactNode;
  title: ReactNode;
  rightAccessory?: ReactNode;
}

export function WorkbenchHeader(props: WorkbenchHeaderProps) {
  return (
    <div className="flex w-full items-center gap-3">
      {props.leftAccessory ? <div className="flex shrink-0 items-center gap-2">{props.leftAccessory}</div> : null}
      <div className="flex min-w-0 flex-1 items-center">{props.title}</div>
      {props.rightAccessory ? <div className="flex h-7 shrink-0 items-center gap-2">{props.rightAccessory}</div> : null}
    </div>
  );
}
