import type { ClientProtocol } from '@two-pebble/protocol';
import { WsBridgeClient } from '@two-pebble/ws-bridge';
import type { Command } from 'commander';
import { DEFAULT_DAEMON_PORT, daemonUrlForPort } from '../consts';

const MAX_DAEMON_PROBES = 100;

interface SetNameOptions {
  agentId: string;
  name: string;
  port?: string;
  url?: string;
}

export function registerAgentCommand(program: Command) {
  const agent = program.command('agent').description('Manage delegate agents through the local daemon.');

  agent
    .command('set-name')
    .requiredOption('--agentId <agentId>', 'agent id (e.g. agents:abc123)')
    .requiredOption('--name <name>', 'new agent name')
    .option('--port <port>', 'daemon port (defaults to scanning)')
    .option('--url <url>', 'daemon websocket URL (overrides --port)')
    .action(async (options: SetNameOptions) => {
      try {
        const url = await resolveDaemonUrl(options);
        const result = await renameAgent(url, options);
        process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        process.stderr.write(`peb agent: ${message}\n`);
        process.exitCode = 1;
      }
    });
}

async function resolveDaemonUrl(options: SetNameOptions): Promise<string> {
  if (options.url !== undefined) return options.url;
  if (process.env.TWO_PEBBLE_DAEMON_URL !== undefined) return process.env.TWO_PEBBLE_DAEMON_URL;
  if (options.port !== undefined) return daemonUrlForPort(parsePort(options.port));
  return scanForAgent(options.agentId);
}

function parsePort(raw: string): number {
  const explicit = Number(raw);
  if (!Number.isInteger(explicit) || explicit <= 0) {
    throw new Error(`invalid --port value "${raw}"`);
  }
  return explicit;
}

async function scanForAgent(agentId: string): Promise<string> {
  const tried: number[] = [];
  for (let port = DEFAULT_DAEMON_PORT; port < DEFAULT_DAEMON_PORT + MAX_DAEMON_PROBES; port += 1) {
    tried.push(port);
    const status = await tryReadStatus(port);
    if (status === null) break;
    if (status.activeAgentIds.includes(agentId)) return daemonUrlForPort(port);
  }
  throw new Error(`no daemon owns agent ${agentId} (scanned ports ${tried.join(', ')})`);
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

async function renameAgent(url: string, options: SetNameOptions) {
  const client = new WsBridgeClient<ClientProtocol>({ url });
  await client.connect(() => undefined);
  try {
    return await client.do('renameAgent', { id: options.agentId, name: options.name });
  } finally {
    client.close();
  }
}
