'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';

const STICKY_BOTTOM_TOLERANCE_PX = 24;

/**
 * Mounts the page already scrolled to the bottom of `window` and keeps
 * the viewport pinned as content streams in. The moment the user scrolls
 * up the pin disengages; if they return within ~24px of the bottom the
 * pin re-engages. Used by trace / waterfall / chronological detail views
 * that render inside `PageLayout` and therefore inherit the document's
 * scroll container rather than owning their own.
 *
 * The initial snap runs synchronously in `useLayoutEffect` so users
 * never see the viewport at the top before it jumps. A `ResizeObserver`
 * on `document.documentElement` re-runs the pin whenever the body
 * grows — handles the async-data-loaded-after-mount case the spec calls
 * out.
 */
export function useStickWindowToBottom(): void {
  const pinnedRef = useRef<boolean>(true);

  useLayoutEffect(() => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'auto' });
  }, []);

  useEffect(() => {
    const isAtBottom = () => {
      const remaining = document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
      return remaining < STICKY_BOTTOM_TOLERANCE_PX;
    };
    const onScroll = () => {
      pinnedRef.current = isAtBottom();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    const observer = new ResizeObserver(() => {
      if (pinnedRef.current) {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'auto' });
      }
    });
    observer.observe(document.documentElement);
    observer.observe(document.body);
    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, []);
}
