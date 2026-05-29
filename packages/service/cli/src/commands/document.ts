import fs from 'node:fs/promises';
import { markdownToTipTap, type TipTapDocument, tipTapToMarkdown } from '@two-pebble/datatypes';
import type { ClientProtocol } from '@two-pebble/protocol';
import { WsBridgeClient } from '@two-pebble/ws-bridge';
import type { Command } from 'commander';
import { DAEMON_URL } from '../consts';

interface ListOptions {
  limit?: string;
  offset?: string;
}

interface ReadOptions {
  id: string;
  json?: boolean;
}

interface WriteOptions {
  file?: string;
  id?: string;
  name: string;
  project?: string;
  stdin?: boolean;
}

interface DeleteOptions {
  id: string;
}

/**
 * Registers document import, export, listing, and deletion commands.
 * Owns the commander surface for TipTap-backed documents.
 * Leaves daemon connection and formatting details in local helpers.
 */
export function registerDocumentCommand(program: Command) {
  const document = program.command('document').description('Manage TipTap-backed documents through the local daemon.');

  document
    .command('list')
    .option('--limit <limit>', 'maximum documents to list', '50')
    .option('--offset <offset>', 'documents to skip', '0')
    .action((options: ListOptions) =>
      runAction(async (client) => {
        const result = await client.do('listDocuments', {
          limit: parsePositiveInteger(options.limit ?? '50', '--limit'),
          offset: parseNonNegativeInteger(options.offset ?? '0', '--offset'),
        });
        writeTable(
          result.items.map((item) => ({
            id: item.id,
            name: item.name,
            updatedAt: new Date(item.updatedAt).toISOString(),
          })),
        );
      }),
    );

  document
    .command('read')
    .requiredOption('--id <id>', 'document id')
    .option('--json', 'print raw TipTap JSON instead of Markdown')
    .action((options: ReadOptions) =>
      runAction(async (client) => {
        const record = await client.do('readDocument', { id: options.id });
        const content = JSON.parse(record.content) as TipTapDocument;
        if (options.json === true) {
          process.stdout.write(`${JSON.stringify(content, null, 2)}\n`);
          return;
        }
        process.stdout.write(`${tipTapToMarkdown(content)}\n`);
      }),
    );

  document
    .command('write')
    .requiredOption('--name <name>', 'document name')
    .option('--id <id>', 'document id to update')
    .option('--project <projectId>', 'project id (required when creating a new document)')
    .option('--file <path>', 'Markdown file to import')
    .option('--stdin', 'read Markdown from stdin')
    .action((options: WriteOptions) =>
      runAction(async (client) => {
        const markdown = await readMarkdownInput(options);
        const content = JSON.stringify(markdownToTipTap(markdown));
        if (options.id !== undefined) {
          const updated = await client.do('updateDocument', { id: options.id, name: options.name, content });
          process.stdout.write(`${updated.id}\n`);
          return;
        }

        if (options.project === undefined) {
          throw new Error('--project is required when creating a new document.');
        }
        const created = await client.do('createDocument', {
          name: options.name,
          content,
          projectId: options.project,
        });
        process.stdout.write(`${created.id}\n`);
      }),
    );

  document
    .command('delete')
    .requiredOption('--id <id>', 'document id')
    .action((options: DeleteOptions) =>
      runAction(async (client) => {
        const deleted = await client.do('deleteDocument', { id: options.id });
        process.stdout.write(`${JSON.stringify(deleted, null, 2)}\n`);
      }),
    );
}

async function runAction(callback: (client: WsBridgeClient<ClientProtocol>) => Promise<void>) {
  try {
    const client = new WsBridgeClient<ClientProtocol>({ url: DAEMON_URL });
    await client.connect(() => undefined);
    try {
      await callback(client);
    } finally {
      client.close();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`peb document: ${message}\n`);
    process.exitCode = 1;
  }
}

async function readMarkdownInput(options: WriteOptions): Promise<string> {
  if (options.file !== undefined && options.stdin === true) {
    throw new Error('choose either --file or --stdin, not both');
  }
  if (options.file !== undefined) {
    return fs.readFile(options.file, 'utf8');
  }
  if (options.stdin === true) {
    return readStdin();
  }
  throw new Error('missing Markdown input; pass --file or --stdin');
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf8');
}

function parsePositiveInteger(raw: string, label: string): number {
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`invalid ${label} value "${raw}"`);
  }
  return value;
}

function parseNonNegativeInteger(raw: string, label: string): number {
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`invalid ${label} value "${raw}"`);
  }
  return value;
}

function writeTable(rows: Array<Record<string, string>>): void {
  if (rows.length === 0) {
    process.stdout.write('No documents.\n');
    return;
  }

  const headers = Object.keys(rows[0]);
  const widths = headers.map((header) =>
    Math.max(header.length, ...rows.map((row) => String(row[header] ?? '').length)),
  );
  const formatRow = (values: string[]) => values.map((value, index) => value.padEnd(widths[index])).join('  ');

  process.stdout.write(`${formatRow(headers)}\n`);
  process.stdout.write(`${formatRow(widths.map((width) => '-'.repeat(width)))}\n`);
  for (const row of rows) {
    process.stdout.write(`${formatRow(headers.map((header) => row[header] ?? ''))}\n`);
  }
}
