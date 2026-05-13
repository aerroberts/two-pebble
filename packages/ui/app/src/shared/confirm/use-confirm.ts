import { useCallback, useState } from 'react';

export interface ConfirmRequest {
  title: string;
  message: string;
  confirmLabel?: string;
}

interface ConfirmDescriptor extends ConfirmRequest {
  resolve: (confirmed: boolean) => void;
}

export interface ConfirmController {
  request: ConfirmRequest | null;
  isOpen: boolean;
  confirm: (request: ConfirmRequest) => Promise<boolean>;
  accept: () => void;
  cancel: () => void;
}

export function useConfirm(): ConfirmController {
  const [descriptor, setDescriptor] = useState<ConfirmDescriptor | null>(null);

  const confirm = useCallback((request: ConfirmRequest) => {
    return new Promise<boolean>((resolve) => {
      setDescriptor({ ...request, resolve });
    });
  }, []);

  const accept = useCallback(() => {
    setDescriptor((current) => {
      current?.resolve(true);
      return null;
    });
  }, []);

  const cancel = useCallback(() => {
    setDescriptor((current) => {
      current?.resolve(false);
      return null;
    });
  }, []);

  return {
    request:
      descriptor === null
        ? null
        : { title: descriptor.title, message: descriptor.message, confirmLabel: descriptor.confirmLabel },
    isOpen: descriptor !== null,
    confirm,
    accept,
    cancel,
  };
}
