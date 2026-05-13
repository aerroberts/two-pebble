interface TimelineActiveIndicatorProps {
  barHeight: number;
}

export function TimelineActiveIndicator(props: TimelineActiveIndicatorProps) {
  const size = Math.min(props.barHeight - 4, 8);
  return (
    <div
      className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <span className="absolute inline-flex h-full w-full rounded-full bg-accent/40 animate-ping" />
      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent/80" />
    </div>
  );
}
