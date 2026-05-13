import type { KeyboardEvent, ReactNode } from 'react';

export interface ModalProps {
  open: boolean;
  children: ReactNode;
  onClose?: () => void;
  title?: string;
  subtitle?: string;
  size?: 'default' | 'large';
}

export function Modal(props: ModalProps) {
  if (!props.open) {
    return null;
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      props.onClose?.();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] overflow-y-auto"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={props.title}
    >
      <button type="button" aria-label="Close modal" className="fixed inset-0 bg-overlay" onClick={props.onClose} />
      <div className="relative flex justify-center px-4 pt-[100px] pb-6">
        <div
          className={`relative z-[1] w-full overflow-auto rounded-lg bg-surface-raised shadow-modal ${props.size === 'large' ? 'max-w-[800px]' : 'max-w-[480px]'}`}
        >
          <button
            type="button"
            onClick={props.onClose}
            className="absolute top-2 right-3 bg-transparent border-none text-xl cursor-pointer leading-none text-content-muted hover:text-content p-1 z-[1]"
            aria-label="Close modal"
          >
            ×
          </button>
          {props.title ? (
            <div className="border-b border-border px-4 pt-4 pb-3">
              <h2 className="text-sm font-semibold leading-5 text-content">{props.title}</h2>
              {props.subtitle ? (
                <p className="mt-0.5 text-[12px] leading-4 text-content-muted">{props.subtitle}</p>
              ) : null}
            </div>
          ) : null}
          {props.children}
        </div>
      </div>
    </div>
  );
}
