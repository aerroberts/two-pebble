'use client';

import { useLayoutEffect, useRef, useState } from 'react';

import { Icon } from '../../content/icon/icon';
import { getButtonRefHandler, getTabButtonClassName } from './tab-helpers';

export interface TabSelectOption {
  value: string;
  label: string;
  icon?: string;
}

export interface TabSelectProps {
  options: TabSelectOption[];
  value: string;
  onChange?: (value: string) => void;
}

interface IndicatorStyle {
  width: number;
  x: number;
  visible: boolean;
}

type TabButtonMap = Map<string, HTMLButtonElement>;

export function TabSelect(props: TabSelectProps) {
  const buttonRefsRef = useRef<TabButtonMap>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<IndicatorStyle>({ width: 0, x: 0, visible: false });
  useLayoutEffect(() => {
    if (!containerRef.current) {
      return;
    }
    const selectedButton = buttonRefsRef.current.get(props.value);
    if (!selectedButton) {
      return;
    }
    setIndicatorStyle({
      width: selectedButton.offsetWidth,
      x: selectedButton.offsetLeft,
      visible: true,
    });
  }, [props.value]);

  return (
    <div ref={containerRef} className="relative inline-flex items-stretch gap-4 border-b border-border">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 z-10 h-px transition-[transform,width,opacity] duration-200 ease-out"
        style={{
          backgroundColor: 'var(--color-accent)',
          opacity: indicatorStyle.visible ? 1 : 0,
          transform: `translateX(${indicatorStyle.x}px)`,
          width: indicatorStyle.width,
        }}
      />
      {props.options.map((option) => (
        <button
          key={option.value}
          ref={getButtonRefHandler(buttonRefsRef.current, option.value)}
          className={getTabButtonClassName(option.value, props.value)}
          type="button"
          onClick={() => props.onChange?.(option.value)}
        >
          {option.icon ? (
            <Icon
              name={option.icon}
              color={option.value === props.value ? 'text-accent' : 'text-current'}
              className="size-3.5"
            />
          ) : null}
          {option.label}
        </button>
      ))}
    </div>
  );
}
