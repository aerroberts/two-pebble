import type { BucketRow } from './types';
import { formatElapsed } from './utils';

interface StackedTimelineXAxisProps {
  buckets: Array<BucketRow>;
  chartStartMs: number;
}

export function StackedTimelineXAxis(props: StackedTimelineXAxisProps) {
  const xLabelStep = Math.max(1, Math.ceil(props.buckets.length / 6));

  return (
    <div className="flex items-center px-2">
      {props.buckets.map((bucket, index) => {
        const showLabel = index % xLabelStep === 0 || index === props.buckets.length - 1;

        return (
          <div key={`label-${bucket.key}`} className="flex-1 min-w-0 text-center">
            {showLabel ? (
              <span className="text-[10px] text-content-muted">{formatElapsed(bucket.endMs - props.chartStartMs)}</span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
