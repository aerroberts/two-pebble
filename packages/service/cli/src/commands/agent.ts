import type { ClientProtocol } from '@two-pebble/protocol';
import { WsBridgeClient } from '@two-pebble/ws-bridge';
import type { Command } from 'commander';
import { DAEMON_URL } from '../consts';

interface SetNameOptions {
  agentId: string;
  name: string;
}

/**
 * Registers agent management commands on the root CLI program.
 */
export function registerAgentCommand(program: Command) {
  const agent = program.command('agent').description('Manage delegate agents through the local daemon.');

  agent
    .command('set-name')
    .requiredOption('--agentId <agentId>', 'agent id (e.g. agents:abc123)')
    .requiredOption('--name <name>', 'new agent name')
    .action(async (options: SetNameOptions) => {
      try {
        const result = await renameAgent(options);
        process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        process.stderr.write(`peb agent: ${message}\n`);
        process.exitCode = 1;
      }
    });
}

async function renameAgent(options: SetNameOptions) {
  const client = new WsBridgeClient<ClientProtocol>({ url: DAEMON_URL });
  await client.connect(() => undefined);
  try {
    return await client.do('renameAgent', { id: options.agentId, name: options.name });
  } finally {
    client.close();
  }
}
