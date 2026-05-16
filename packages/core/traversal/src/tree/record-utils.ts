import type { TraversalNodeRecord } from '../types';

export const recordUtils = {
  pushRecord(records: TraversalNodeRecord[], record: TraversalNodeRecord) {
    record.id = `node:${records.length}`;
    records.push(record);
    return record;
  },

  recordFrom(records: TraversalNodeRecord[], id: string) {
    const record = records.find((candidate) => candidate.id === id);
    if (!record) {
      throw new Error(`Unknown traversal node: ${id}`);
    }
    return record;
  },
};
