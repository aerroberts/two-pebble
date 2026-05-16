export function outer(value: string) {
  function inner(input: string) {
    const arrowInsideFunction = (suffix: string) => {
      return `${input}:${suffix}`;
    };

    return arrowInsideFunction(value);
  }

  const arrowInsideOuter = (input: string) => {
    const nestedArrow = (suffix: string) => {
      return `${input}-${suffix}`;
    };

    return nestedArrow(value);
  };

  return [inner(value), arrowInsideOuter(value)].join(',');
}

export const exportedArrow = (value: string) => {
  return outer(value);
};

export async function asyncOuter(fetchText: (path: string) => Promise<string>, path: string) {
  const text = await fetchText(path);
  const asyncArrow = async (suffix: string) => {
    const innerText = await fetchText(`${path}.${suffix}`);
    return `${text}:${innerText}`;
  };

  return asyncArrow('next');
}
