import * as RadixSelect from '@radix-ui/react-select';
import { useEffect, useState } from 'react';

import type { SelectOption } from './select';

export interface SelectContentProps {
  options: SelectOption[];
  open?: boolean;
  mobilePresentation?: 'popover' | 'drawer';
}

const drawerItemClass =
  'cursor-pointer rounded-md px-3 py-3 text-[13px] font-medium leading-5 text-content outline-none data-[highlighted]:bg-surface-hover data-[state=checked]:bg-accent/[0.12] data-[state=checked]:text-accent';

const popoverItemClass =
  'cursor-pointer rounded-md px-2 py-1.5 text-[12px] font-medium leading-4 text-content outline-none data-[highlighted]:bg-surface-hover data-[state=checked]:bg-accent/[0.12] data-[state=checked]:text-accent';

export function SelectContent(props: SelectContentProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const syncIsMobile = () => setIsMobile(mediaQuery.matches);
    syncIsMobile();
    mediaQuery.addEventListener('change', syncIsMobile);
    return () => mediaQuery.removeEventListener('change', syncIsMobile);
  }, []);

  const useDrawer = props.mobilePresentation === 'drawer' && isMobile;
  const contentClassName = useDrawer
    ? 'fixed inset-x-0 bottom-0 z-[1100] max-h-[70vh] overflow-hidden rounded-t-lg border border-border bg-surface shadow-modal transition-[opacity,transform] duration-200 data-[state=open]:translate-y-0 data-[state=closed]:translate-y-4 data-[state=closed]:opacity-0'
    : 'z-[1100] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-border bg-surface shadow-lg';
  const viewportClassName = useDrawer ? 'min-h-0 p-2' : 'min-h-0 p-1';
  const itemClassName = useDrawer ? drawerItemClass : popoverItemClass;

  return (
    <>
      {useDrawer && props.open ? (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-[1050] bg-overlay" />
      ) : null}
      <RadixSelect.Content
        className={contentClassName}
        position={useDrawer ? 'item-aligned' : 'popper'}
        sideOffset={useDrawer ? undefined : 4}
        align={useDrawer ? undefined : 'start'}
      >
        {useDrawer ? <div className="mx-auto my-2 h-1.5 w-10 rounded-full bg-content/[0.12]" /> : null}
        <RadixSelect.Viewport className={viewportClassName}>
          {props.options.map((option) => (
            <RadixSelect.Item key={option.value} value={option.value} className={itemClassName}>
              <span className="flex items-center gap-2">
                {option.icon ? <span className="shrink-0">{option.icon}</span> : null}
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
              </span>
            </RadixSelect.Item>
          ))}
        </RadixSelect.Viewport>
      </RadixSelect.Content>
    </>
  );
}
