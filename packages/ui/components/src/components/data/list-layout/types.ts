import type { ReactNode } from 'react';

export interface ListLayoutItem {
  key?: string | number;
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  value?: ReactNode;
  trailingAccessory?: ReactNode;
  href?: string;
  onClick?: () => void;
  active?: boolean;
}
