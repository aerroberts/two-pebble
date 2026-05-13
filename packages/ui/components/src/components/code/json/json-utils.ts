export function stringifyJsonForDisplay(data: unknown) {
  const text = JSON.stringify(data, null, 2);
  return text ?? 'null';
}
