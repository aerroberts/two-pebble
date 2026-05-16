export function readName(name: string) {
  if (name.length > 0) {
    if (name.length > 1) {
      return name;
    }
  }

  return name;
}
