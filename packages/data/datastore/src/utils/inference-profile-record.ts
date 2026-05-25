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

export function toInferenceProfileRecord(
  row: InferenceProfileRow,
  provider: InferenceProfileProvider,
): InferenceProfileRecord {
  return { ...row, provider } as InferenceProfileRecord;
}
