export type PlaceholderTone = 'neutral' | 'blue' | 'amber' | 'rose' | 'emerald' | 'violet';

export const defaultTone: PlaceholderTone = 'neutral';

export const toneClasses: Record<PlaceholderTone, string> = {
  neutral: 'bg-surface text-content-muted border-border',
  blue: 'bg-blue-50 text-blue-400 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800',
  amber: 'bg-amber-50 text-amber-400 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
  rose: 'bg-rose-50 text-rose-400 border-rose-200 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800',
  emerald:
    'bg-emerald-50 text-emerald-400 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
  violet:
    'bg-violet-50 text-violet-400 border-violet-200 dark:bg-violet-950 dark:text-violet-400 dark:border-violet-800',
};
