import type { ButtonVariant } from './button';

export function getButtonVariantClassName(variant: ButtonVariant) {
  if (variant === 'primary') {
    return 'border-accent bg-accent text-accent-content hover:bg-accent-hover';
  }

  return 'border-border bg-surface text-content hover:bg-surface-hover';
}
