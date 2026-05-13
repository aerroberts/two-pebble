import { expect } from 'bun:test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export function expectFileSnapshot(received: string, snapshotUrl: URL): void {
  const snapshotPath = fileURLToPath(snapshotUrl);

  if (process.env.UPDATE_SNAPSHOTS === '1') {
    mkdirSync(dirname(snapshotPath), { recursive: true });
    writeFileSync(snapshotPath, received);
  }

  expect(received).toBe(readFileSync(snapshotPath, 'utf-8'));
}
