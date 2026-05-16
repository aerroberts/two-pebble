export function globExpression(pattern: string) {
  let expression = '^';
  for (let index = 0; index < pattern.length; index++) {
    const char = pattern[index];
    const next = pattern[index + 1];
    const afterNext = pattern[index + 2];

    if (char === '*' && next === '*' && afterNext === '/') {
      expression += '(?:.*/)?';
      index += 2;
      continue;
    }
    if (char === '*' && next === '*') {
      expression += '.*';
      index += 1;
      continue;
    }
    if (char === '*') {
      expression += '[^/]*';
      continue;
    }

    expression += escapeRegExp(char ?? '');
  }
  return `${expression}$`;
}

export function matchesGlob(path: string, pattern: string) {
  return new RegExp(globExpression(pattern)).test(path);
}

function escapeRegExp(value: string) {
  return value.replace(/[.+^${}()|[\]\\]/g, '\\$&');
}
