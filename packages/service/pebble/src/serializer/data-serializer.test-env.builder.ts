import type { NullableZodSchema } from './types';

export type SchemaCase = [string, string, NullableZodSchema];

export function renderSchemaSnapshot(input: string, output: string): string {
  return [input, '', '', '-----', '', output].join('\n');
}
