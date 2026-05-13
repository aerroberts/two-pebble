export type RelativeTimeValue = Date | number | string | null | undefined;

export function getValidDate(value: RelativeTimeValue) {
  const parsedDate = new Date(value ?? '');

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

export function formatRelativeTime(dateValue: number, nowValue: number) {
  const differenceInSeconds = Math.max(0, Math.floor((nowValue - dateValue) / 1000));

  if (differenceInSeconds < 60) {
    return 'Just now';
  }

  const units = [
    { label: 'minute', seconds: 60 },
    { label: 'hour', seconds: 3600 },
    { label: 'day', seconds: 86_400 },
    { label: 'week', seconds: 604_800 },
    { label: 'month', seconds: 2_592_000 },
    { label: 'year', seconds: 31_536_000 },
  ] as const;

  for (let index = units.length - 1; index >= 0; index -= 1) {
    const unit = units[index];

    if (differenceInSeconds >= unit.seconds) {
      const count = Math.floor(differenceInSeconds / unit.seconds);
      return `${count} ${unit.label}${count === 1 ? '' : 's'} ago`;
    }
  }

  return 'Just now';
}
