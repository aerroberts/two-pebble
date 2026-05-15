'use client';

import { useEffect, useState } from 'react';
import { applyTheme, getStoredTheme, isTheme, type Theme, themes } from './theme';

export interface ThemeToggleProps {
  storageKey?: string;
}

export function ThemeToggle(props: ThemeToggleProps) {
  const key = props.storageKey ?? 'theme';
  const [theme, setTheme] = useState<Theme>('tangerine');

  useEffect(() => {
    const initial = getStoredTheme(key);
    setTheme(initial);
    applyTheme(initial);
  }, [key]);

  function handleChange(value: string) {
    if (!isTheme(value)) {
      return;
    }
    setTheme(value);
    localStorage.setItem(key, value);
    applyTheme(value);
  }

  return (
    <div className="w-full overflow-hidden rounded-md border border-border bg-border">
      <div className="grid grid-cols-4 gap-px">
        {themes.map((item) => {
          const selected = item.name === theme;
          const selectedClass = selected ? 'bg-accent/[0.12]' : 'bg-surface hover:bg-surface-hover';

          return (
            <button
              key={item.name}
              type="button"
              className={`h-full w-full p-2 text-left transition-colors ${selectedClass}`}
              onClick={() => handleChange(item.name)}
            >
              <div className="flex h-10 overflow-hidden rounded-[2px]">
                {item.colors.map((color) => (
                  <span key={color} className="flex-1" style={{ backgroundColor: color }} />
                ))}
              </div>
              <div className="mt-2 px-1 pb-0.5 text-xs font-medium text-content">{item.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
