'use client';

import { type MouseEvent, type PointerEvent, useEffect, useMemo, useRef, useState } from 'react';

import { Tooltip } from '../../providers/tooltip/tooltip-trigger';
import { TimelineBar } from './timeline-bar';
import { TimelineLegend } from './timeline-legend';
import { buildColorMap, computeLayout, formatDuration, toEpochMs } from './timeline-utils';
import type {
  HoveredItemId,
  NormalizedItem,
  TimelineChartProps,
  TimelineChartSelectedRange,
  TimeTooltipData,
} from './types';

export type {
  TimelineChartItem,
  TimelineChartProps,
  TimelineChartRangeOption,
  TimelineChartSelectedRange,
  TimelineChartStatus,
  TimelineMetric,
} from './types';

interface DragSelection {
  startPercent: number;
  currentPercent: number;
}

type NormalizedRangeOption = TimelineChartSelectedRange & { label: string };

export function TimelineChart(props: TimelineChartProps) {
  const {
    items,
    className = '',
    height = 420,
    gridIntervalMs = 5 * 60 * 1000,
    emptyMessage = 'No timeline data available',
    showLegend = true,
    showVerticalLines = true,
    rangeOptions = [],
    defaultRangeLabel,
    onItemClick,
    onRangeSelect,
    nowTimestamp = Date.now(),
  } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const [disabledCategories, setDisabledCategories] = useState<Set<string>>(new Set());
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [timeTooltip, setTimeTooltip] = useState<TimeTooltipData | null>(null);
  const [selectedRangeLabel, setSelectedRangeLabel] = useState<string | null>(defaultRangeLabel ?? null);
  const [customRange, setCustomRange] = useState<TimelineChartSelectedRange | null>(null);
  const [dragSelection, setDragSelection] = useState<DragSelection | null>(null);

  const normalizedItems = useMemo<Array<NormalizedItem>>(() => {
    return items
      .map((item) => {
        const startMs = toEpochMs(item.startTime);
        const endMs =
          item.endTime !== undefined
            ? toEpochMs(item.endTime)
            : item.status === 'in-progress'
              ? nowTimestamp
              : startMs + 1000;
        if (Number.isNaN(startMs) || Number.isNaN(endMs)) return null;
        return { item, startMs, endMs: Math.max(endMs, startMs + 1) };
      })
      .filter((entry): entry is NormalizedItem => !!entry);
  }, [items, nowTimestamp]);

  const categories = useMemo(() => {
    const values = new Set<string>();
    for (const entry of normalizedItems) {
      values.add(entry.item.category ?? entry.item.label);
    }
    return Array.from(values).sort();
  }, [normalizedItems]);

  const colorMap = useMemo(() => buildColorMap(categories, normalizedItems), [categories, normalizedItems]);

  const filteredItems = useMemo(() => {
    return normalizedItems.filter((entry) => !disabledCategories.has(entry.item.category ?? entry.item.label));
  }, [normalizedItems, disabledCategories]);

  const dataRange = useMemo(() => {
    if (normalizedItems.length === 0)
      return { startMs: nowTimestamp, endMs: nowTimestamp + 1000, totalDurationMs: 1000 };
    const start = Math.min(...normalizedItems.map((entry) => entry.startMs));
    const end = Math.max(...normalizedItems.map((entry) => entry.endMs));
    return { startMs: start, endMs: end, totalDurationMs: Math.max(end - start, 1000) };
  }, [normalizedItems, nowTimestamp]);

  const normalizedRangeOptions = useMemo(
    () =>
      rangeOptions
        .map((range) => {
          const start = toEpochMs(range.start);
          const stop = toEpochMs(range.stop);
          if (Number.isNaN(start) || Number.isNaN(stop) || stop <= start) return null;
          return { label: range.label, start, stop };
        })
        .filter((range): range is NormalizedRangeOption => !!range),
    [rangeOptions],
  );

  useEffect(() => {
    if (normalizedRangeOptions.length === 0) {
      setSelectedRangeLabel(null);
      return;
    }
    setSelectedRangeLabel((current) => {
      if (current && normalizedRangeOptions.some((range) => range.label === current)) return current;
      if (defaultRangeLabel && normalizedRangeOptions.some((range) => range.label === defaultRangeLabel)) {
        return defaultRangeLabel;
      }
      return normalizedRangeOptions[0]?.label ?? null;
    });
  }, [defaultRangeLabel, normalizedRangeOptions]);

  const selectedRangeOption = useMemo(
    () => normalizedRangeOptions.find((range) => range.label === selectedRangeLabel),
    [normalizedRangeOptions, selectedRangeLabel],
  );

  const activeRange = customRange ?? selectedRangeOption;
  const startMs = activeRange ? activeRange.start : dataRange.startMs;
  const endMs = activeRange ? activeRange.stop : dataRange.endMs;
  const totalDurationMs = Math.max(endMs - startMs, 1000);

  const visibleItems = useMemo(
    () => filteredItems.filter((entry) => entry.endMs > startMs && entry.startMs < endMs),
    [endMs, filteredItems, startMs],
  );

  const { placed, rowCount } = useMemo(() => {
    return computeLayout({ normalized: visibleItems, startMs, endMs, totalDurationMs });
  }, [endMs, startMs, totalDurationMs, visibleItems]);

  const gridLines = useMemo(() => {
    if (gridIntervalMs <= 0) return [];
    const lines: Array<number> = [];
    let time = Math.ceil(startMs / gridIntervalMs) * gridIntervalMs;
    if (time <= startMs) time += gridIntervalMs;
    while (time < endMs) {
      lines.push(((time - startMs) / totalDurationMs) * 100);
      time += gridIntervalMs;
    }
    return lines;
  }, [endMs, gridIntervalMs, startMs, totalDurationMs]);

  useEffect(() => {
    if (!hoveredItemId) return;
    const hoveredItem = items.find((item) => item.id === hoveredItemId);
    if (!hoveredItem) {
      setHoveredItemId(null);
      return;
    }
    const category = hoveredItem.category ?? hoveredItem.label;
    if (disabledCategories.has(category)) {
      setHoveredItemId(null);
    }
  }, [disabledCategories, hoveredItemId, items]);

  if (normalizedItems.length === 0) {
    return <p className="text-xs text-content-muted">{emptyMessage}</p>;
  }

  const rowHeight = Math.min(20, height / Math.max(rowCount, 1));
  const barHeight = Math.max(rowHeight - 4, 4);

  const toggleCategory = (category: string) => {
    setDisabledCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const getTimelinePercent = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width <= 0) return 0;
    const x = clientX - rect.left;
    return Math.min(100, Math.max(0, (x / rect.width) * 100));
  };

  const handleTimelineMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (dragSelection) return;
    const percent = getTimelinePercent(event.clientX);
    if (percent === undefined) return;
    setTimeTooltip({
      timeMs: Math.max(0, (percent / 100) * totalDurationMs),
      percent,
    });
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const target = event.target;
    if (target instanceof Element && target.closest('[data-timeline-bar="true"]')) return;
    const percent = getTimelinePercent(event.clientX);
    if (percent === undefined) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setTimeTooltip(null);
    setDragSelection({ startPercent: percent, currentPercent: percent });
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragSelection) return;
    const percent = getTimelinePercent(event.clientX);
    if (percent === undefined) return;
    setDragSelection((current) => (current ? { ...current, currentPercent: percent } : current));
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragSelection) return;
    const percent = getTimelinePercent(event.clientX) ?? dragSelection.currentPercent;
    const startPercent = Math.min(dragSelection.startPercent, percent);
    const endPercent = Math.max(dragSelection.startPercent, percent);
    setDragSelection(null);
    if (endPercent - startPercent < 0.5) return;
    const nextRange = {
      start: startMs + (startPercent / 100) * totalDurationMs,
      stop: startMs + (endPercent / 100) * totalDurationMs,
    };
    setCustomRange(nextRange);
    setSelectedRangeLabel(null);
    onRangeSelect?.(nextRange);
  };

  const handleHoverChange = (itemId: HoveredItemId) => {
    setHoveredItemId(itemId);
    if (itemId) setTimeTooltip(null);
  };

  const handleRangeOptionClick = (range: TimelineChartSelectedRange) => {
    setSelectedRangeLabel(range.label ?? null);
    setCustomRange(null);
    onRangeSelect?.(range);
  };

  const timelineTooltipData = timeTooltip && !hoveredItemId ? { Offset: `+${formatDuration(timeTooltip.timeMs)}` } : {};
  const selectionOverlay = dragSelection
    ? {
        left: Math.min(dragSelection.startPercent, dragSelection.currentPercent),
        width: Math.abs(dragSelection.currentPercent - dragSelection.startPercent),
      }
    : null;

  return (
    <div className={`space-y-3 ${className}`}>
      {normalizedRangeOptions.length > 0 ? (
        <div className="flex justify-end">
          <div className="inline-flex overflow-hidden rounded-sm bg-surface-alt p-0.5">
            {normalizedRangeOptions.map((range) => {
              const active = !customRange && selectedRangeLabel === range.label;
              return (
                <button
                  key={range.label}
                  type="button"
                  className={`px-2 py-1 text-xs transition-colors ${
                    active ? 'bg-surface text-content shadow-sm' : 'text-content-muted hover:bg-surface-hover'
                  }`}
                  onClick={() => handleRangeOptionClick(range)}
                >
                  {range.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
      <Tooltip compact data={timelineTooltipData}>
        {/* biome-ignore lint/a11y/noStaticElementInteractions: supports timeline hover and drag range selection */}
        <div
          ref={containerRef}
          className="relative select-none touch-none"
          style={{ height }}
          onMouseMove={handleTimelineMouseMove}
          onMouseLeave={() => setTimeTooltip(null)}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => setDragSelection(null)}
        >
          {showVerticalLines
            ? gridLines.map((percent) => (
                <div
                  key={`grid-${percent}`}
                  className="absolute top-0 bottom-0 w-px bg-border"
                  style={{ left: `${percent}%` }}
                />
              ))
            : null}

          {showVerticalLines && timeTooltip && !hoveredItemId ? (
            <div
              className="absolute top-0 bottom-0 w-px bg-content-subtle pointer-events-none opacity-50"
              style={{ left: `${timeTooltip.percent}%` }}
            />
          ) : null}

          {selectionOverlay && selectionOverlay.width > 0 ? (
            <div
              className="absolute top-0 bottom-0 pointer-events-none bg-accent/15 outline outline-1 outline-accent/40"
              style={{ left: `${selectionOverlay.left}%`, width: `${selectionOverlay.width}%` }}
            />
          ) : null}

          {placed.map((entry) => (
            <TimelineBar
              key={entry.item.id}
              entry={entry}
              colorMap={colorMap}
              rowHeight={rowHeight}
              barHeight={barHeight}
              onItemClick={onItemClick}
              onHoverChange={handleHoverChange}
            />
          ))}
        </div>
      </Tooltip>

      {showLegend ? (
        <TimelineLegend
          categories={categories}
          colorMap={colorMap}
          disabledCategories={disabledCategories}
          normalizedItems={normalizedItems}
          onToggle={toggleCategory}
        />
      ) : null}
    </div>
  );
}
