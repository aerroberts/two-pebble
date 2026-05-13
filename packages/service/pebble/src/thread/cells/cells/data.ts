import type { PebbleDataRecord } from '../../../types';

export function data(value: PebbleDataRecord) {
  return {
    type: 'data' as const,
    content: {
      value,
    },
  };
}
