'use client';

import { Check, CircleAlert, Info } from 'lucide-react';
import { createContext, type ReactNode, useCallback, useMemo } from 'react';
import { toast as sonnerToast, Toaster } from 'sonner';

type ToastVariant = 'error' | 'success' | 'info';

export interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

export const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
});

export interface ToastProviderProps {
  children: ReactNode;
  duration?: number;
}

const variantIcon: Record<ToastVariant, ReactNode> = {
  success: <Check className="h-4 w-4 shrink-0 text-success" />,
  error: <CircleAlert className="h-4 w-4 shrink-0 text-danger" />,
  info: <Info className="h-4 w-4 shrink-0 text-info" />,
};

export function ToastProvider(props: ToastProviderProps) {
  const duration = props.duration ?? 5000;

  const toast = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      sonnerToast.custom(
        () => (
          <div className="flex w-[360px] max-w-[calc(100vw-2rem)] items-center gap-2.5 rounded-lg border border-border bg-surface-raised px-4 py-3 text-sm text-content shadow-panel">
            {variantIcon[variant]}
            <span className="min-w-0 flex-1">{message}</span>
          </div>
        ),
        { duration },
      );
    },
    [duration],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {props.children}
      <Toaster position="bottom-right" />
    </ToastContext.Provider>
  );
}
