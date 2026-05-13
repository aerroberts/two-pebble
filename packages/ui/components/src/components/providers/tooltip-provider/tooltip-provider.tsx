'use client';

import * as RadixTooltip from '@radix-ui/react-tooltip';
import type { ReactNode } from 'react';

export interface TooltipProviderProps {
  children: ReactNode;
  delayDuration?: number;
  skipDelayDuration?: number;
}

export function TooltipProvider(props: TooltipProviderProps) {
  return (
    <RadixTooltip.Provider
      delayDuration={props.delayDuration ?? 180}
      skipDelayDuration={props.skipDelayDuration ?? 120}
    >
      {props.children}
    </RadixTooltip.Provider>
  );
}
