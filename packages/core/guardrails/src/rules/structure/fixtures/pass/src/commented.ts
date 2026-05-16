import { readFile } from 'node:fs/promises';

/**
 * Creates an example service used by structure fixtures.
 */
export class ExampleService {
  public run(input: string) {
    return input;
  }
}

export interface ExampleInput {
  value: string;
}

export async function loadExample(path: string) {
  return readFile(path, 'utf-8');
}
