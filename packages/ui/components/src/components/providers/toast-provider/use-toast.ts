'use client';

import { useContext } from 'react';

import { ToastContext } from './toast-provider';

export function useToast() {
  return useContext(ToastContext);
}
