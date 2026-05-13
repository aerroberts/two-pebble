import type { ToolInput } from '@two-pebble/pebble';
import type { ClientProtocol } from '@two-pebble/protocol';
import { WsBridgeClient } from '@two-pebble/ws-bridge';
import type { Command } from 'commander';
import { DEFAULT_DAEMON_PORT, daemonUrlForPort } from '../consts';

const MAX_DAEMON_PROBES = 100;

interface CallToolOptions {
  agentId: string;
  input: string;
  port?: string;
  toolId: string;
  url?: string;
}

export function registerCallToolCommand(program: Command) {
  program
    .command('call-tool')
    .requiredOption('--toolId <toolId>', 'agent-owned tool id')
    .requiredOption('--agentId <agentId>', 'active agent id')
    .requiredOption('--input <json>', 'JSON input passed to the tool')
    .option('--port <port>', 'force a specific daemon port instead of scanning')
    .option('--url <url>', 'daemon websocket URL (overrides --port)')
    .action(async (options: CallToolOptions) => {
      try {
        const url = await resolveDaemonUrl(options);
        const result = await callTool(url, options);
        process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        process.stderr.write(`${message}\n`);
        process.exitCode = 1;
      }
    });
}

async function resolveDaemonUrl(options: CallToolOptions): Promise<string> {
  if (options.url !== undefined) return options.url;
  if (process.env.TWO_PEBBLE_DAEMON_URL !== undefined) return process.env.TWO_PEBBLE_DAEMON_URL;
  if (options.port !== undefined) return daemonUrlForPort(parsePort(options.port));
  return scanForAgent(options.agentId);
}

function parsePort(raw: string): number {
  const explicit = Number(raw);
  if (!Number.isInteger(explicit) || explicit <= 0) {
    throw new Error(`peb call-tool: invalid --port value "${raw}"`);
  }
  return explicit;
}

async function scanForAgent(agentId: string): Promise<string> {
  const tried: number[] = [];
  for (let port = DEFAULT_DAEMON_PORT; port < DEFAULT_DAEMON_PORT + MAX_DAEMON_PROBES; port += 1) {
    tried.push(port);
    const status = await tryReadStatus(port);
    if (status === null) {
      // No daemon listening here — agents only live in a contiguous block.
      break;
    }
    if (status.activeAgentIds.includes(agentId)) {
      return daemonUrlForPort(port);
    }
  }
  throw new Error(`peb call-tool: no daemon owns agent ${agentId} (scanned ports ${tried.join(', ')})`);
}

async function tryReadStatus(port: number) {
  const client = new WsBridgeClient<ClientProtocol>({ url: daemonUrlForPort(port) });
  try {
    await client.connect(() => undefined);
  } catch {
    return null;
  }
  try {
    return await client.do('getDaemonStatus', {});
  } catch {
    return null;
  } finally {
    client.close();
  }
}

async function callTool(url: string, options: CallToolOptions) {
  const client = new WsBridgeClient<ClientProtocol>({ url });
  await client.connect(() => undefined);
  try {
    const response = await client.do('callAgentTool', {
      agentId: options.agentId,
      input: parseToolInput(options.input),
      toolId: options.toolId,
    });
    return response.result;
  } finally {
    client.close();
  }
}

function parseToolInput(raw: string): ToolInput {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return assertToolInput(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid --input JSON: ${message}`);
  }
}

function assertToolInput(input: unknown): ToolInput {
  if (input === null || typeof input === 'string' || typeof input === 'number' || typeof input === 'boolean') {
    return input;
  }

  if (Array.isArray(input)) {
    return input.map((item) => assertToolInput(item));
  }

  if (typeof input === 'object') {
    return Object.fromEntries(Object.entries(input).map(([key, value]) => [key, assertToolInput(value)])) as ToolInput;
  }

  throw new Error('input must be JSON object, array, string, number, boolean, or null');
}
