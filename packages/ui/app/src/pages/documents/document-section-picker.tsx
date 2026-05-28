import { AutocompleteInput, type AutocompleteSuggestion, IconButton, Tooltip } from '@two-pebble/components';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface DocumentSectionPickerProps {
  currentSection: string;
  suggestions: AutocompleteSuggestion[];
  onCommit: (next: string) => void;
}

export function DocumentSectionPicker(props: DocumentSectionPickerProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(props.currentSection);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDraft(props.currentSection);
  }, [props.currentSection]);

  const updateRect = useCallback(() => {
    const el = triggerRef.current;
    if (el) {
      setRect(el.getBoundingClientRect());
    }
  }, []);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  const handleToggle = useCallback(() => {
    if (open) {
      close();
      return;
    }
    updateRect();
    setOpen(true);
  }, [close, open, updateRect]);

  const handleCommit = useCallback(
    (next: string) => {
      props.onCommit(next);
      close();
    },
    [close, props],
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }
      close();
    };
    const onScroll = () => updateRect();
    document.addEventListener('pointerdown', onPointerDown, true);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open, close, updateRect]);

  const tooltipLabel = props.currentSection.length > 0 ? `Section: ${props.currentSection}` : 'Set section';

  return (
    <>
      <div ref={triggerRef}>
        <Tooltip content={tooltipLabel}>
          <IconButton
            aria-label="Set document section"
            icon="folder"
            onClick={handleToggle}
            type="button"
            variant={props.currentSection.length > 0 ? 'primary' : 'secondary'}
          />
        </Tooltip>
      </div>
      {open && rect
        ? createPortal(
            <div
              ref={panelRef}
              className="fixed z-[1100] w-[16rem] rounded-md border border-border bg-surface p-2 shadow-lg"
              style={{ top: rect.bottom + 4, right: Math.max(8, window.innerWidth - rect.right) }}
            >
              <AutocompleteInput
                ariaLabel="Document section"
                leadingIcon="folder"
                onChange={setDraft}
                onCommit={handleCommit}
                placeholder="No section"
                suggestions={props.suggestions}
                value={draft}
              />
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
