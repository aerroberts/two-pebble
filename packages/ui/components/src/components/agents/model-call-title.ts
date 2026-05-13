export function formatModelCallTitle(input: { data: unknown; verb: string }) {
  const label = readProviderModelLabel(input.data);

  if (label.length === 0) {
    return `${input.verb} model`;
  }

  return `${input.verb} ${label}`;
}

function readProviderModelLabel(data: unknown) {
  if (data === null || typeof data !== 'object') {
    return '';
  }

  const record = data as Record<string, unknown>;
  const provider = typeof record.provider === 'string' ? record.provider : '';
  const modelId = typeof record.modelId === 'string' ? record.modelId : '';

  if (provider.length === 0) {
    return modelId;
  }

  if (modelId.length === 0) {
    return provider;
  }

  return `${provider}/${modelId}`;
}
