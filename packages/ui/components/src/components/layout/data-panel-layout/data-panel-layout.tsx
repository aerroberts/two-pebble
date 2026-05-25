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
  /**
   * Optional title rendered inline with the close button at the top of
   * the side panel. Kept at a modest size so long titles don't truncate
   * or push the close affordance off-screen.
   */
  title?: ReactNode;
}

export function DataPanelLayout(props: DataPanelLayoutProps) {
  const gridClass = props.open ? 'grid-cols-[minmax(0,1fr)_600px]' : 'grid-cols-[minmax(0,1fr)_0px]';
  const showCloseButton = props.closeable === true && props.onClose !== undefined;
  const showHeader = showCloseButton || props.title !== undefined;

  return (
    <div className={`grid h-full min-h-0 transition-[grid-template-columns] duration-200 ease-in-out ${gridClass}`}>
      <main className="flex flex-col min-h-0 overflow-auto">{props.children}</main>
      <aside
        className={`border-l border-border bg-surface min-h-0 overflow-y-auto transition-opacity duration-200 ${
          props.open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        {showHeader ? (
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-surface px-4 pt-6">
            <div className="min-w-0 flex-1 truncate text-[13px] font-medium text-content">{props.title}</div>
            {showCloseButton ? <IconButton icon="x" variant="secondary" onClick={props.onClose} /> : null}
          </div>
        ) : null}
        <div className={`px-6 pb-5 ${showHeader ? 'pt-3' : 'pt-6'}`}>{props.panel}</div>
      </aside>
    </div>
  );
}
