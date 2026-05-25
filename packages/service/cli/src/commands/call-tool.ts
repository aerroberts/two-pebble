import type { ToolInput } from '@two-pebble/pebble';
import type { ClientProtocol } from '@two-pebble/protocol';
import { WsBridgeClient } from '@two-pebble/ws-bridge';
import type { Command } from 'commander';
import { DAEMON_URL } from '../consts';

interface CallToolOptions {
  agentId: string;
  input: string;
  toolId: string;
}

/**
 * Registers the CLI entrypoint for invoking an agent-owned tool.
 * Owns argument wiring and error reporting for the command.
 * Leaves tool input validation in local helpers.
 */
export function registerCallToolCommand(program: Command) {
  program
    .command('call-tool')
    .requiredOption('--toolId <toolId>', 'agent-owned tool id')
    .requiredOption('--agentId <agentId>', 'active agent id')
    .requiredOption('--input <json>', 'JSON input passed to the tool')
    .action(async (options: CallToolOptions) => {
      try {
        const result = await callTool(options);
        process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        process.stderr.write(`${message}\n`);
        process.exitCode = 1;
      }
    });
}

async function callTool(options: CallToolOptions) {
  const client = new WsBridgeClient<ClientProtocol>({ url: DAEMON_URL });
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
