import { spawn } from 'node:child_process';
import { access } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import type { IdeKind, KnownIde } from '@two-pebble/datatypes';

interface IdeDefinition {
  kind: IdeKind;
  displayName: string;
  cliName: string;
  bundleExecutables: string[];
}

const ideDefinitions: IdeDefinition[] = [
  {
    kind: 'vscode',
    displayName: 'Visual Studio Code',
    cliName: 'code',
    bundleExecutables:
      process.platform === 'win32'
        ? [
            path.join(process.env.LOCALAPPDATA ?? '', 'Programs', 'Microsoft VS Code', 'Code.exe'),
            path.join(process.env.ProgramFiles ?? '', 'Microsoft VS Code', 'Code.exe'),
          ]
        : process.platform === 'darwin'
          ? [
              '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code',
              path.join(
                os.homedir(),
                'Applications',
                'Visual Studio Code.app',
                'Contents',
                'Resources',
                'app',
                'bin',
                'code',
              ),
            ]
          : ['/usr/bin/code', '/usr/local/bin/code'],
  },
  {
    kind: 'zed',
    displayName: 'Zed',
    cliName: 'zed',
    bundleExecutables:
      process.platform === 'win32'
        ? [path.join(process.env.LOCALAPPDATA ?? '', 'Programs', 'Zed', 'zed.exe')]
        : process.platform === 'darwin'
          ? [
              '/Applications/Zed.app/Contents/MacOS/cli',
              path.join(os.homedir(), 'Applications', 'Zed.app', 'Contents', 'MacOS', 'cli'),
            ]
          : ['/usr/bin/zed', '/usr/local/bin/zed'],
  },
  {
    kind: 'cursor',
    displayName: 'Cursor',
    cliName: 'cursor',
    bundleExecutables:
      process.platform === 'win32'
        ? [
            path.join(process.env.LOCALAPPDATA ?? '', 'Programs', 'cursor', 'Cursor.exe'),
            path.join(process.env.ProgramFiles ?? '', 'Cursor', 'Cursor.exe'),
          ]
        : process.platform === 'darwin'
          ? [
              '/Applications/Cursor.app/Contents/Resources/app/bin/cursor',
              path.join(os.homedir(), 'Applications', 'Cursor.app', 'Contents', 'Resources', 'app', 'bin', 'cursor'),
            ]
          : ['/usr/bin/cursor', '/usr/local/bin/cursor'],
  },
];

export async function detectInstalledIdes(): Promise<KnownIde[]> {
  const candidates = await Promise.all(ideDefinitions.map(detectIde));
  return candidates.filter((candidate): candidate is KnownIde => candidate !== null);
}

async function detectIde(definition: IdeDefinition): Promise<KnownIde | null> {
  const cliPath = await findOnPath(definition.cliName);
  if (cliPath.length > 0) {
    return {
      kind: definition.kind,
      displayName: definition.displayName,
      executablePath: cliPath,
    };
  }

  for (const executablePath of definition.bundleExecutables) {
    if (executablePath.length === 0) {
      continue;
    }
    if (await pathExists(executablePath)) {
      return {
        kind: definition.kind,
        displayName: definition.displayName,
        executablePath,
      };
    }
  }

  return null;
}

async function findOnPath(cliName: string): Promise<string> {
  const command = process.platform === 'win32' ? 'where' : 'which';
  return new Promise((resolve) => {
    const child = spawn(command, [cliName], { stdio: ['ignore', 'pipe', 'ignore'] });
    let stdout = '';
    child.stdout?.on('data', (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.on('error', () => resolve(''));
    child.on('close', (code) => {
      if (code !== 0) {
        resolve('');
        return;
      }
      const lines = stdout
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      resolve(lines[0] ?? '');
    });
  });
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}
