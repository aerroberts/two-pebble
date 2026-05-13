import type { ReactNode } from 'react';

import { IconButton } from '../../input/icon-button/icon-button';

export interface DataPanelLayoutProps {
  open: boolean;
  panel: ReactNode;
  children: ReactNode;
  /**
   * When true, render a close button that calls `onClose`. Defaults to
   * false — callers that want the user to dismiss the panel by clicking
   * the selected item again should leave this off so the X doesn't show.
   */
  closeable?: boolean;
  onClose?: () => void;
}

export function DataPanelLayout(props: DataPanelLayoutProps) {
  const gridClass = props.open ? 'grid-cols-[minmax(0,1fr)_600px]' : 'grid-cols-[minmax(0,1fr)_0px]';
  const showCloseButton = props.closeable === true && props.onClose !== undefined;

  return (
    <div className={`grid h-full min-h-0 transition-[grid-template-columns] duration-200 ease-in-out ${gridClass}`}>
      <main className="flex flex-col min-h-0 overflow-auto">{props.children}</main>
      <aside
        className={`border-l border-border bg-surface min-h-0 overflow-y-auto transition-opacity duration-200 ${
          props.open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        {showCloseButton ? (
          <div className="sticky top-0 z-10 flex justify-end bg-surface px-4 pt-6">
            <IconButton icon="x" variant="secondary" onClick={props.onClose} />
          </div>
        ) : null}
        <div className={`px-6 pb-5 ${showCloseButton ? 'pt-3' : 'pt-6'}`}>{props.panel}</div>
      </aside>
    </div>
  );
}
