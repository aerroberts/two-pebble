import type { CSSProperties } from 'react';

import { Tooltip } from '../../providers/tooltip/tooltip-trigger';
import { TimelineActiveIndicator } from './timeline-active-indicator';
import { getTimelineBarTooltip } from './timeline-bar-tooltip';
import { getBarColor } from './timeline-utils';
import type { PlacedItem, TimelineChartItem } from './types';

interface TimelineBarProps {
  entry: PlacedItem;
  colorMap: Map<string, string>;
  rowHeight: number;
  barHeight: number;
  onItemClick?: (item: TimelineChartItem) => void;
  onHoverChange?: (itemId: string | null) => void;
}

export function TimelineBar(props: TimelineBarProps) {
  const { entry, colorMap, rowHeight, barHeight, onItemClick, onHoverChange } = props;
  const width = Math.max(entry.endPercent - entry.startPercent, 0);
  const color = getBarColor(entry.item, colorMap);
  const isActive = entry.item.status === 'in-progress' && entry.item.endTime === undefined;
  const isLink = Boolean(entry.item.href);

  const barStyle: CSSProperties = {
    left: `${entry.startPercent}%`,
    width: `${width}%`,
    minWidth: 0,
    top: entry.row * rowHeight,
    height: barHeight,
    backgroundColor: color,
  };

  const handleEnter = () => onHoverChange?.(entry.item.id);
  const handleLeave = () => onHoverChange?.(null);
  const barBody = isActive ? <TimelineActiveIndicator barHeight={barHeight} /> : null;
  const tooltip = getTimelineBarTooltip({ entry });

  return (
    <Tooltip header={tooltip.header} data={tooltip.data}>
      {isLink ? (
        <a
          href={entry.item.href}
          data-timeline-bar="true"
          aria-label={entry.item.label}
          title={entry.item.label}
          className="absolute rounded hover:brightness-110 transition-all border-0 p-0 cursor-pointer"
          style={barStyle}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          onClick={() => onItemClick?.(entry.item)}
        >
          {barBody}
        </a>
      ) : (
        <button
          type="button"
          data-timeline-bar="true"
          aria-label={entry.item.label}
          title={entry.item.label}
          className="absolute rounded hover:brightness-110 transition-all border-0 p-0 cursor-pointer"
          style={barStyle}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          onClick={() => onItemClick?.(entry.item)}
        >
          {barBody}
        </button>
      )}
    </Tooltip>
  );
}
