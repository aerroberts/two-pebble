interface StackedTimelineBarSegmentProps {
  color?: string;
  segmentKey: string;
  value: number;
  bucketTotal: number;
}

export function StackedTimelineBarSegment(props: StackedTimelineBarSegmentProps) {
  if (props.value <= 0 || props.bucketTotal <= 0) {
    return null;
  }

  return (
    <div
      key={props.segmentKey}
      style={{
        backgroundColor: props.color,
        height: `${(props.value / props.bucketTotal) * 100}%`,
      }}
    />
  );
}
