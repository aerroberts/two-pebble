import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Command } from 'commander';
import { DEFAULT_DAEMON_PORT } from '../consts';

interface RunOptions {
  port?: string;
}

/**
 * Registers the `peb run` subcommand.
 * Hints the daemon to start at the default port; the daemon itself increments
 * upward when the preferred port is busy so concurrent instances coexist.
 */
export function registerDaemonCommand(program: Command) {
  program
    .command('run')
    .description('Run the Two Pebble daemon (production mode, no watch).')
    .option('--port <port>', 'force a specific port instead of probing from the default')
    .action((options: RunOptions) => {
      const port = resolvePortHint(options);
      const cliDirectory = dirname(fileURLToPath(import.meta.url));
      const daemonEntry = resolve(cliDirectory, '..', '..', 'daemon', 'scripts', 'daemon.ts');
      process.stdout.write(`peb run: starting daemon (${daemonEntry})\n`);
      process.stdout.write(`peb run: hint port ${port} — daemon picks the first free port at or above this\n`);
      process.stdout.write('peb run: opening UI when daemon is ready\n');
      process.stdout.write('peb run: Ctrl-C to stop\n');
      const child = spawn('bun', [daemonEntry], {
        stdio: 'inherit',
        env: { ...process.env, TWO_PEBBLE_OPEN_UI: '1', TWO_PEBBLE_PORT: String(port) },
      });
      forwardSignal('SIGINT', child);
      forwardSignal('SIGTERM', child);
      forwardSignal('SIGHUP', child);
      child.on('exit', (code) => {
        process.stdout.write(`peb run: daemon exited (code ${code ?? 0})\n`);
        process.exit(code ?? 0);
      });
    });
}

function resolvePortHint(options: RunOptions): number {
  if (options.port === undefined) {
    return DEFAULT_DAEMON_PORT;
  }
  const explicit = Number(options.port);
  if (!Number.isInteger(explicit) || explicit <= 0) {
    throw new Error(`peb run: invalid --port value "${options.port}"`);
  }
  return explicit;
}

function forwardSignal(signal: NodeJS.Signals, child: ReturnType<typeof spawn>) {
  process.on(signal, () => {
    if (child.pid !== undefined && !child.killed) {
      child.kill(signal);
    }
  });
}
