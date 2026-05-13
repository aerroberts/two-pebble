import { relative, resolve } from 'node:path';
import { Controller } from '../../runner/controller';
import type { RuleConfig, RunResult } from '../../types';

const fixturesDir = resolve(import.meta.dirname, 'fixtures');

const config: RuleConfig = {
  rules: [
    {
      match: 'src/features/**/*.ts',
      existence: 'must-exist',
      recommendation: 'Feature source files should exist and be documented.',
      rules: [
        {
          match: '{$name}.md',
          existence: 'must-exist',
          contains: ['# User'],
          excludes: ['deprecated marker'],
          recommendation: 'Every feature source file needs a matching markdown note.',
        },
      ],
    },
    {
      match: 'src/domain/**/test',
      type: 'must-be-dir',
      recommendation: 'Test nodes must be directories.',
      rules: [
        {
          match: '*',
          type: 'must-be-file',
          contains: ['test marker'],
          recommendation: 'Test directories should contain files directly.',
        },
      ],
    },
    {
      match: 'src/protocol/*',
      type: 'must-be-file',
      fileNameEndsWith: '.ts',
      allowedImports: [],
      recommendation: 'Protocol files are self-contained bridge contracts.',
    },
    {
      match: 'src/operations/*',
      type: 'must-be-file',
      extract: {
        $operationFile: '$name',
      },
      recommendation: 'Operation files should be collected for test coverage checks.',
    },
    {
      match: 'src/tests/*.test.ts',
      type: 'must-be-file',
      exhaustiveContains: ["describe('$operationFile')"],
      recommendation: 'Tests should mention every operation file by name.',
    },
  ],
};

const storybookConfig: RuleConfig = {
  rules: [
    {
      match: 'src/components/**/*.tsx',
      type: 'must-be-file',
      where: {
        fileNameMatchesParentDirectory: true,
        moduleKind: 'single-exported-function-module',
      },
      recommendation: 'Public Storybook component modules should be selected from directory entry files.',
      rules: [
        {
          match: '{$name}.story.tsx',
          existence: 'must-exist',
          type: 'must-be-file',
          recommendation: 'Every public Storybook component module needs a sibling story file.',
        },
      ],
    },
  ],
};

export async function runCodeStructureFixture(fixture: string) {
  return new Controller().run(resolve(fixturesDir, fixture), {
    additional: {
      '@rule/code-structure': config,
    },
  });
}

export async function runStorybookStructureFixture(fixture: string) {
  return new Controller().run(resolve(fixturesDir, fixture), {
    additional: {
      '@rule/code-structure': storybookConfig,
    },
  });
}

export function codeStructureFixturePath(fixture: string, file: string | undefined) {
  return file ? relative(resolve(fixturesDir, fixture), file).replaceAll('\\', '/').replace(/\/$/, '') : undefined;
}

export function codeStructureFailureSummary(result: RunResult) {
  const diagnostics = result.results
    .flatMap((entry) => entry.diagnostics)
    .map((diagnostic) => ({
      error: diagnostic.error,
      file: codeStructureFixturePath('fail', diagnostic.file),
    }))
    .sort((left, right) => `${left.file}:${left.error}`.localeCompare(`${right.file}:${right.error}`));

  return {
    errors: diagnostics.map((diagnostic) => diagnostic.error),
    files: diagnostics.map((diagnostic) => diagnostic.file),
  };
}

export function storybookStructureFailureSummary(result: RunResult) {
  return result.results
    .flatMap((entry) => entry.diagnostics)
    .map((diagnostic) => ({
      error: diagnostic.error,
      file: codeStructureFixturePath('storybook-fail', diagnostic.file),
    }));
}
