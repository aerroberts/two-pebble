import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import type { RuleConfig } from '../types';
import { Controller } from './controller';

interface GuardDefinitionContent {
  definition: string;
  additional: GuardDefinitionRules;
}

interface GuardDefinitionRules {
  [ruleName: string]: RuleConfig;
}

const typeSafetyRuleConfig = {
  forbiddenSyntax: ['any', 'unknown', 'satisfies', 'globalThis'],
};

const inheritedStructureRuleConfig = {
  find: [
    {
      find: 'src/inherited.ts',
      assert: { exists: true },
      recommendation: 'Inherited structure rules should still run.',
    },
  ],
};

const localStructureRuleConfig = {
  find: [
    {
      find: 'src/local.ts',
      assert: { contains: ['local marker'] },
      recommendation: 'Local structure rules should append to inherited rules.',
    },
  ],
};

export function controllerTestEnv() {
  return {
    async runInheritedDefinition() {
      return withRepo(async (repoDir) => {
        writePackageJson(repoDir);
        writeGuardDefinition(repoDir, 'guardrails-example.guard', {
          definition: '@group/example',
          additional: {
            '@rule/typescript-type-safety': typeSafetyRuleConfig,
          },
        });

        const packageDir = resolve(repoDir, 'packages/example');
        writeSourceFile(packageDir, 'src/bad.ts', "const value: any = 'bad';\nexport { value };\n");

        return new Controller().run(packageDir, { inherit: '@group/example' });
      });
    },
    async runMissingDefinition() {
      return withRepo(async (repoDir) => {
        writePackageJson(repoDir);

        const packageDir = resolve(repoDir, 'packages/example');
        writeSourceFile(packageDir, 'src/good.ts', "const value: string = 'good';\nexport { value };\n");

        return new Controller().run(packageDir, { inherit: '@group/missing' });
      });
    },
    async runMergedStructureDefinitions() {
      return withRepo(async (repoDir) => {
        writePackageJson(repoDir);
        writeGuardDefinition(repoDir, 'guardrails-example.guard', {
          definition: '@group/example',
          additional: {
            '@rule/structure': inheritedStructureRuleConfig,
          },
        });

        const packageDir = resolve(repoDir, 'packages/example');
        writeSourceFile(packageDir, 'src/local.ts', 'export {};\n');

        return new Controller().run(packageDir, {
          inherit: '@group/example',
          additional: {
            '@rule/structure': localStructureRuleConfig,
          },
        });
      });
    },
  };
}

async function withRepo<T>(run: (repoDir: string) => Promise<T>) {
  const repoDir = mkdtempSync(resolve(tmpdir(), 'guardrails-controller-'));

  try {
    return await run(repoDir);
  } finally {
    rmSync(repoDir, { force: true, recursive: true });
  }
}

function writePackageJson(repoDir: string) {
  writeFileSync(resolve(repoDir, 'package.json'), JSON.stringify({ workspaces: ['packages/*'] }));
}

function writeGuardDefinition(repoDir: string, file: string, content: GuardDefinitionContent) {
  writeFileSync(resolve(repoDir, file), JSON.stringify(content));
}

function writeSourceFile(packageDir: string, file: string, content: string) {
  const path = resolve(packageDir, file);
  mkdirSync(resolve(path, '..'), { recursive: true });
  writeFileSync(path, content);
}
