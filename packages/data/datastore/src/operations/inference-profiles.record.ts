import type { InferenceProfileProvider, InferenceProfileRecord } from '../types';

interface InferenceProfileRow {
  createdAt: number;
  data: InferenceProfileRecord['data'];
  id: string;
  integrationId: string;
  kind: InferenceProfileRecord['kind'];
  name: string;
  updatedAt: number;
}

/**
 * Reattaches the provider derived from the owning integration to the stored
 * profile row. The database stores `kind`/`data` and integration separately,
 * so TypeScript cannot prove the recomposed shape is the discriminated
 * `InferenceProfile` union without this boundary cast.
 */
export function toInferenceProfileRecord(
  row: InferenceProfileRow,
  provider: InferenceProfileProvider,
): InferenceProfileRecord {
  return { ...row, provider } as InferenceProfileRecord;
}
