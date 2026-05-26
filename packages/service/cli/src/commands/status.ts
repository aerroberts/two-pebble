import type { ClientProtocol } from '@two-pebble/protocol';
import { WsBridgeClient } from '@two-pebble/ws-bridge';
import type { Command } from 'commander';
import { DAEMON_URL } from '../consts';

/**
 * Registers the `peb status` subcommand.
 * Connects to the daemon at the hardcoded port and prints its status JSON.
 * Exits 1 if the daemon is unreachable.
 */
export function registerStatusCommand(program: Command) {
  program
    .command('status')
    .description('Print daemon status JSON.')
    .action(async () => {
      try {
        const status = await readDaemonStatus();
        process.stdout.write(`${JSON.stringify(status, null, 2)}\n`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        process.stderr.write(`peb status: ${message}\n`);
        process.exitCode = 1;
      }
    });
}

async function readDaemonStatus() {
  const client = new WsBridgeClient<ClientProtocol>({ url: DAEMON_URL });
  await client.connect(() => undefined);
  try {
    return await client.do('getDaemonStatus', {});
  } finally {
    client.close();
  }
}
