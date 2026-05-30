import { describe, expect, test } from 'bun:test';
import { Cell } from '@two-pebble/pebble';
import { buildReferenceSystemTraceContent } from './reference-system-trace';

describe('feature: reference system trace context', () => {
  test('happy: returns nothing when no skill or memory references are present', () => {
    expect(buildReferenceSystemTraceContent([Cell.text('hello')])).toBeUndefined();
  });

  test('happy: renders resolved skill and memory prompt blocks', () => {
    const content = buildReferenceSystemTraceContent([
      Cell.skillReference({
        description: 'Reads logs',
        diskFolderPath: '/tmp/skills/logs',
        files: ['index.md', 'scripts/read.ts'],
        name: 'Log Reader',
        skillId: 'skills:logs',
      }),
      Cell.memoryReference({
        files: ['index.md', 'incidents/one.md'],
        index: 'Use this collection for incident notes.',
        memoryId: 'memories:incidents',
        name: 'Incidents',
      }),
    ]);

    expect(content).toEqual([
      Cell.header1('Resolved Reference Context'),
      Cell.text('Trace-only view of resolved skill and memory context injected into the model prompt.'),
      Cell.header2('Skill: Log Reader'),
      Cell.text(
        '[skill: Log Reader] Reads logs\nFolder (read/run with workspace tools): /tmp/skills/logs\nFiles: index.md, scripts/read.ts',
      ),
      Cell.header2('Memory: Incidents'),
      Cell.text(
        '{begin memory: Incidents (memoryId: memories:incidents)}\nindex.md:\nUse this collection for incident notes.\nFiles (read via memory-read-file with this memoryId):\n- index.md\n- incidents/one.md\n{end memory}',
      ),
    ]);
  });
});
