import { type ReactNode, useEffect, useLayoutEffect, useRef } from 'react';

export interface ChatPageLayoutProps {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
  width?: 'fixed' | 'full';
  /**
   * When true, the scrollable body opens pinned to the bottom and stays
   * pinned as new content streams in (chat behaviour). Users can scroll
   * up to break the pin; the moment they return to within ~24px of the
   * bottom the pin re-engages. No animated scroll on mount — the viewport
   * is at the bottom on first paint.
   */
  pinScrollToBottom?: boolean;
}

const STICKY_BOTTOM_TOLERANCE_PX = 24;

export function ChatPageLayout(props: ChatPageLayoutProps) {
  const width = props.width ?? 'full';
  const rootClassName =
    width === 'fixed'
      ? 'w-full min-h-0 flex flex-1 flex-col items-center bg-surface'
      : 'w-full min-h-0 flex flex-1 flex-col bg-surface';
  const sectionClassName =
    width === 'fixed' ? 'w-full max-w-[1200px] flex min-w-0 flex-col px-8' : 'flex min-w-0 flex-col px-8';

  const bodyRef = useRef<HTMLDivElement | null>(null);
  const pinnedRef = useRef<boolean>(true);
  const pinScrollToBottom = props.pinScrollToBottom === true;

  // Initial snap-to-bottom runs synchronously before the browser paints
  // so users never see the viewport at the top before it jumps. Subsequent
  // pinning happens through the ResizeObserver below; this just handles
  // the first-paint case.
  useLayoutEffect(() => {
    if (!pinScrollToBottom) {
      return;
    }
    const el = bodyRef.current;
    if (el !== null) {
      el.scrollTop = el.scrollHeight;
    }
  }, [pinScrollToBottom]);

  useEffect(() => {
    if (!pinScrollToBottom) {
      return;
    }
    const el = bodyRef.current;
    if (el === null) {
      return;
    }
    const isAtBottom = () => el.scrollHeight - el.scrollTop - el.clientHeight < STICKY_BOTTOM_TOLERANCE_PX;
    const onScroll = () => {
      pinnedRef.current = isAtBottom();
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    const observer = new ResizeObserver(() => {
      if (pinnedRef.current) {
        el.scrollTop = el.scrollHeight;
      }
    });
    observer.observe(el);
    for (const child of Array.from(el.children)) {
      observer.observe(child);
    }
    return () => {
      el.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, [pinScrollToBottom]);

  return (
    <div className={rootClassName}>
      <header className={`${sectionClassName} shrink-0 pt-5`}>{props.header}</header>
      <div className={`${sectionClassName} min-h-0 flex-1 overflow-y-auto`} ref={bodyRef}>
        {props.children}
      </div>
      <footer className={`${sectionClassName} shrink-0 pb-4 pt-3`}>{props.footer}</footer>
    </div>
  );
}
