import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Datastore } from '@two-pebble/datastore';
import type { TipTapDocument } from '@two-pebble/datatypes';
import { renderAgentRegistrySystemPrompt } from './registry-system-prompt';

const tempRoots: string[] = [];

function makeTempDir(prefix: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  tempRoots.push(dir);
  return dir;
}

afterAll(() => {
  for (const dir of tempRoots) {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});

let skillFolder: string;
let memoryFolder: string;

beforeAll(() => {
  skillFolder = makeTempDir('reg-skill-');
  fs.writeFileSync(path.join(skillFolder, 'SKILL.md'), '# Log Reader');
  fs.writeFileSync(path.join(skillFolder, 'run.ts'), 'export const run = () => {};');

  memoryFolder = makeTempDir('reg-memory-');
  fs.writeFileSync(path.join(memoryFolder, 'index.md'), 'Incident notes live here.');
  fs.writeFileSync(path.join(memoryFolder, 'one.md'), 'First incident.');
});

/**
 * Builds a system prompt doc that contains nothing but a single document
 * mention — the exact shape that surfaced the serialization bug.
 */
function promptReferencing(documentId: string, name: string): TipTapDocument {
  return {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'documentMention', attrs: { documentId, name } }] }],
  };
}

/**
 * A referenced document whose body mentions a skill and a memory — the
 * nested references that previously degraded to bare `*name` / `@name`.
 */
function documentBody(skillId: string, memoryId: string): string {
  const doc: TipTapDocument = {
    type: 'doc',
    content: [
      { type: 'paragraph', content: [{ type: 'text', text: 'Follow the runbook.' }] },
      {
        type: 'paragraph',
        content: [
          { type: 'skillMention', attrs: { skillId, name: 'Log Reader' } },
          { type: 'memoryMention', attrs: { memoryId, name: 'Incidents' } },
        ],
      },
    ],
  };
  return JSON.stringify(doc);
}

function fakeDatastore(): Datastore {
  return {
    documents: {
      read: async ({ id }: { id: string }) => {
        if (id === 'documents:1') {
          return { id, name: 'Runbook', content: documentBody('skills:1', 'memories:1'), updatedAt: 0 };
        }
        throw new Error(`document not found: ${id}`);
      },
    },
    skills: {
      read: async ({ id }: { id: string }) => ({
        id,
        name: 'Log Reader',
        description: 'Reads logs',
        diskFolderPath: skillFolder,
      }),
    },
    memories: {
      read: async ({ id }: { id: string }) => ({ id, name: 'Incidents', path: memoryFolder }),
    },
    taskBoards: {
      read: async ({ id }: { id: string }) => ({ id, name: 'Launch' }),
    },
  } as unknown as Datastore;
}

describe('feature: agent registry system prompt rendering', () => {
  test('happy: expands a referenced document and serializes its nested skill and memory richly', async () => {
    const prompt = await renderAgentRegistrySystemPrompt({
      agentId: 'agents:1',
      datastore: fakeDatastore(),
      kind: 'framework',
      systemPrompt: promptReferencing('documents:1', 'Runbook'),
    });

    // Document content is expanded inline.
    expect(prompt).toContain('Follow the runbook.');
    expect(prompt).toContain('<document-reference name="Runbook" id="documents:1">');

    // The skill nested in the document is serialized as a rich descriptor
    // with its absolute on-disk folder, not a bare `*Log Reader`.
    expect(prompt).toContain('# Referenced resources');
    expect(prompt).toContain('## Skills');
    expect(prompt).toContain('[skill: Log Reader] Reads logs');
    expect(prompt).toContain(`Folder (read/run with workspace tools): ${skillFolder}`);
    expect(prompt).toContain('SKILL.md');

    // The memory nested in the document brings its usage prompt, absolute
    // folder, and curated index.
    expect(prompt).toContain('## Memory collections');
    expect(prompt).toContain(`Absolute folder: ${memoryFolder}`);
    expect(prompt).toContain('{begin memory: Incidents (memoryId: memories:1)}');
    expect(prompt).toContain('Incident notes live here.');
  });

  test('edge: a missing referenced document degrades to an unavailable marker', async () => {
    const prompt = await renderAgentRegistrySystemPrompt({
      agentId: 'agents:1',
      datastore: fakeDatastore(),
      kind: 'pebble',
      systemPrompt: promptReferencing('documents:missing', 'Ghost'),
    });

    expect(prompt).toContain('[document Ghost (id: documents:missing) is unavailable]');
    expect(prompt).not.toContain('# Referenced resources');
  });
});
