import type { TooltipData } from '../../providers/tooltip/tooltip-trigger';
import type { BucketRow, StackedTimelineBarChartSeries, ValueFormatter } from './types';
import { formatElapsed, getTooltipRows } from './utils';

interface StackedTimelineBucketTooltipProps {
  bucket: BucketRow;
  chartStartMs: number;
  enabledSeries: Array<StackedTimelineBarChartSeries>;
  valueFormatter: ValueFormatter;
}

export function getStackedTimelineBucketTooltipData(props: StackedTimelineBucketTooltipProps): TooltipData {
  return {
    Bucket: `${formatElapsed(props.bucket.startMs - props.chartStartMs)} - ${formatElapsed(props.bucket.endMs - props.chartStartMs)}`,
    Total: props.valueFormatter(props.bucket.total),
    ...Object.fromEntries(
      getTooltipRows(props.bucket, props.enabledSeries, props.valueFormatter).map((row) => [row.label, row.value]),
    ),
  };
}
