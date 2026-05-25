import { existsSync, readdirSync, statSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import type { WorkspaceNode } from '@two-pebble/traversal';
import type { AssertContext } from '../assert-context';
import type { AssertOutcome, CapabilityLayoutAssert } from '../types';

/**
 * Enforces the canonical capability folder contract:
 * - immediate capability folders have index.ts and <folder>-capability.ts
 * - immediate capability folders have tools/ and prompts/
 * - direct files are limited to index.ts and <folder>-capability.ts
 * - prompts/ contains only Markdown files
 */
export function validate(_nodes: WorkspaceNode[], config: CapabilityLayoutAssert, ctx?: AssertContext): AssertOutcome {
  if (!ctx) {
    return { passed: false, description: 'capabilityLayout assertion requires runner context.' };
  }
  const root = resolve(ctx.packageDir, config.root);
  if (!existsSync(root) || !statSync(root).isDirectory()) {
    return { passed: false, description: `Capability root ${config.root} does not exist or is not a directory.` };
  }

  const problems: string[] = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }
    const capabilityName = entry.name;
    const capabilityDir = resolve(root, capabilityName);
    const indexFile = resolve(capabilityDir, 'index.ts');
    const capabilityFile = resolve(capabilityDir, `${capabilityName}-capability.ts`);
    const toolsDir = resolve(capabilityDir, 'tools');
    const promptsDir = resolve(capabilityDir, 'prompts');

    if (!existsSync(indexFile) || !statSync(indexFile).isFile()) {
      problems.push(`${capabilityName}: missing index.ts`);
    }
    if (!existsSync(capabilityFile) || !statSync(capabilityFile).isFile()) {
      problems.push(`${capabilityName}: missing ${capabilityName}-capability.ts`);
    }
    if (!existsSync(toolsDir) || !statSync(toolsDir).isDirectory()) {
      problems.push(`${capabilityName}: missing tools/`);
    }
    if (!existsSync(promptsDir) || !statSync(promptsDir).isDirectory()) {
      problems.push(`${capabilityName}: missing prompts/`);
    }

    for (const child of readdirSync(capabilityDir, { withFileTypes: true })) {
      if (!child.isFile()) {
        continue;
      }
      const allowed = child.name === 'index.ts' || child.name === `${capabilityName}-capability.ts`;
      if (!allowed) {
        problems.push(`${capabilityName}: direct file ${child.name} must move under tools/, prompts/, or utils/`);
      }
    }

    if (existsSync(promptsDir) && statSync(promptsDir).isDirectory()) {
      for (const promptProblem of promptFolderProblems(promptsDir, ctx.packageDir)) {
        problems.push(`${capabilityName}: ${promptProblem}`);
      }
    }
  }

  if (problems.length === 0) {
    return { passed: true };
  }
  return {
    passed: false,
    description: `Capability layout violations: ${formatList(problems)}.`,
  };
}

function promptFolderProblems(promptsDir: string, packageDir: string): string[] {
  const problems: string[] = [];
  for (const entry of readdirSync(promptsDir, { withFileTypes: true })) {
    const path = resolve(promptsDir, entry.name);
    if (entry.isDirectory()) {
      problems.push(`prompts entry ${relative(packageDir, path)} must be a Markdown file, not a directory`);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith('.md')) {
      problems.push(`prompts entry ${relative(packageDir, path)} must be a Markdown file`);
    }
  }
  return problems;
}

function formatList(values: string[]) {
  const limit = 12;
  const shown = values.slice(0, limit);
  if (values.length > limit) {
    shown.push(`and ${values.length - limit} more`);
  }
  return shown.join('; ');
}
