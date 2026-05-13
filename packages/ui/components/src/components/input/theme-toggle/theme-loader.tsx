'use client';

import { useEffect } from 'react';
import { applyTheme, getStoredTheme } from './theme';

export interface ThemeLoaderProps {
  storageKey?: string;
}

export function ThemeLoader(props: ThemeLoaderProps) {
  const key = props.storageKey ?? 'theme';

  useEffect(() => {
    applyTheme(getStoredTheme(key));
  }, [key]);

  return null;
}
