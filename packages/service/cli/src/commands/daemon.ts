import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Command } from 'commander';
import { DAEMON_PORT } from '../consts';

/**
 * Registers the `peb run` subcommand.
 * Starts the daemon on the hardcoded port; only one daemon instance is
 * supported at a time.
 */
export function registerDaemonCommand(program: Command) {
  program
    .command('run')
    .description('Run the Two Pebble daemon (production mode, no watch).')
    .action(() => {
      const cliDirectory = dirname(fileURLToPath(import.meta.url));
      const daemonEntry = resolve(cliDirectory, '..', '..', 'daemon', 'scripts', 'daemon.ts');
      process.stdout.write(`peb run: starting daemon (${daemonEntry})\n`);
      process.stdout.write(`peb run: port ${DAEMON_PORT}\n`);
      process.stdout.write('peb run: opening UI when daemon is ready\n');
      process.stdout.write('peb run: Ctrl-C to stop\n');
      const child = spawn('bun', [daemonEntry], {
        stdio: 'inherit',
        env: { ...process.env, TWO_PEBBLE_OPEN_UI: '1', TWO_PEBBLE_PORT: String(DAEMON_PORT) },
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

function forwardSignal(signal: NodeJS.Signals, child: ReturnType<typeof spawn>) {
  process.on(signal, () => {
    if (child.pid !== undefined && !child.killed) {
      child.kill(signal);
    }
  });
}
