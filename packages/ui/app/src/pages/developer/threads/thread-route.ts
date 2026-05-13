export function parseCellOrderId(value: string | undefined) {
  if (value === undefined) {
    return null;
  }

  if (!/^\d+$/.test(value)) {
    return null;
  }

  return Number.parseInt(value, 10);
}
