import type { ClientProtocol } from '@two-pebble/protocol';
import { WsBridgeClient } from '@two-pebble/ws-bridge';
import type { Command } from 'commander';
import { DEFAULT_DAEMON_PORT, daemonUrlForPort } from '../consts';

interface StatusOptions {
  port?: string;
}

/**
 * Registers the `peb status` subcommand.
 * Connects to the daemon at the requested port (or the default) and prints
 * its status JSON. Exits 1 if the daemon at that port is unreachable.
 */
export function registerStatusCommand(program: Command) {
  program
    .command('status')
    .description('Print daemon status JSON.')
    .option('--port <port>', 'connect to the daemon on this port instead of the default')
    .action(async (options: StatusOptions) => {
      const port = resolveStatusPort(options);
      try {
        const status = await readDaemonStatus(port);
        process.stdout.write(`${JSON.stringify(status, null, 2)}\n`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        process.stderr.write(`peb status: ${message}\n`);
        process.exitCode = 1;
      }
    });
}

function resolveStatusPort(options: StatusOptions): number {
  if (options.port === undefined) {
    return DEFAULT_DAEMON_PORT;
  }
  const explicit = Number(options.port);
  if (!Number.isInteger(explicit) || explicit <= 0) {
    throw new Error(`peb status: invalid --port value "${options.port}"`);
  }
  return explicit;
}

async function readDaemonStatus(port: number) {
  const client = new WsBridgeClient<ClientProtocol>({ url: daemonUrlForPort(port) });
  await client.connect(() => undefined);
  try {
    return await client.do('getDaemonStatus', {});
  } finally {
    client.close();
  }
}
