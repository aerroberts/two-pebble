import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { formatResults } from '../reporter';
import type { GuardrailConfig } from '../types';
import { Controller } from './controller';
import { parseGuardConfig } from './guard-config-parser';

const packageDir = process.cwd();
const guardPath = resolve(packageDir, 'code.guard');

let raw: string;

try {
  raw = readFileSync(guardPath, 'utf-8');
} catch (error) {
  const errno = error as NodeJS.ErrnoException;

  if (errno.code === 'ENOENT') {
    process.stdout.write('No code.guard found, nothing to check.\n');
    process.exit(0);
  }

  process.stderr.write(`Could not read ${guardPath}\n`);
  process.exit(1);
}

let config: GuardrailConfig;

try {
  config = parseGuardConfig(raw);
} catch {
  process.stderr.write(`Could not parse ${guardPath} as comment JSON.\n`);
  process.exit(1);
}

if (config === null || typeof config !== 'object' || Array.isArray(config)) {
  process.stdout.write('code.guard must contain a JSON object, nothing to check.\n');
  process.exit(0);
}

const controller = new Controller();

try {
  const result = await controller.run(packageDir, config);
  process.stdout.write(`${formatResults(result)}\n`);
  process.exit(result.passed ? 0 : 1);
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown guardrail failure.';
  process.stderr.write(`${message}\n`);
  process.exit(1);
}
