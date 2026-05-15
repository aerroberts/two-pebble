import { spawn } from 'node:child_process';

/**
 * Resolves the absolute path of an installed `codex` CLI by spawning
 * `which codex` (or `where` on Windows). Returns an empty string when not
 * found instead of throwing.
 */
export async function detectCodexExecutable(): Promise<string> {
  const command = process.platform === 'win32' ? 'where' : 'which';
  return new Promise((resolve) => {
    const child = spawn(command, ['codex'], { stdio: ['ignore', 'pipe', 'ignore'] });
    let stdout = '';
    child.stdout?.on('data', (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.on('error', () => resolve(''));
    child.on('close', (code) => {
      if (code === 0) {
        const lines = stdout
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0);
        resolve(lines[0] ?? '');
        return;
      }
      resolve('');
    });
  });
}
