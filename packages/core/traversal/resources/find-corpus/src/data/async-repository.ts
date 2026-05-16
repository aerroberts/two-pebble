export interface AsyncRepositoryOptions {
  path: string;
}

export async function readAsyncRepository(
  options: AsyncRepositoryOptions,
  readText: (path: string) => Promise<string>,
) {
  const contents = await readText(options.path);
  const normalize = async (value: string) => {
    const trimmed = await Promise.resolve(value.trim());
    return trimmed.toLowerCase();
  };

  return normalize(contents);
}
