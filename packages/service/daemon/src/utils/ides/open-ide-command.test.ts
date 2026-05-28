import { describe, expect, test } from 'bun:test';
import { getIdeOpenCommand } from './open-ide-command';

describe('getIdeOpenCommand', () => {
  test('opens bundled Zed through macOS open', () => {
    expect(
      getIdeOpenCommand('zed', '/Applications/Zed.app/Contents/MacOS/cli', '/Users/eric/project', 'darwin'),
    ).toEqual(['open', '-a', '/Applications/Zed.app', '/Users/eric/project']);
  });

  test('uses the configured executable when Zed is not a macOS app bundle', () => {
    expect(getIdeOpenCommand('zed', '/usr/local/bin/zed', '/workspace', 'linux')).toEqual([
      '/usr/local/bin/zed',
      '/workspace',
    ]);
  });

  test('keeps other IDEs on their configured executable', () => {
    expect(getIdeOpenCommand('vscode', '/usr/local/bin/code', '/workspace', 'darwin')).toEqual([
      '/usr/local/bin/code',
      '/workspace',
    ]);
  });
});
