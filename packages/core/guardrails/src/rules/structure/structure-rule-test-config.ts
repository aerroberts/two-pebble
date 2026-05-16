const structureRuleFind = [
  {
    find: 'src/**/*.ts',
    assert: {
      type: 'file',
      fileName: { endsWith: '.ts' },
      contains: ['export', 'ExampleService'],
      missing: ['forbidden', 'deprecated'],
    },
    recommendation: 'Structure fixtures should only contain exported TypeScript examples.',
  },
  {
    find: 'src/**/*.ts/export/class',
    assert: { exists: true, type: 'token:class' },
    recommendation: 'Exported classes are part of this fixture contract.',
    traverse: [
      {
        find: '$prev-sibling',
        assert: { type: 'token:block-comment', tokenLineLength: { min: 3, max: 4 } },
        recommendation: 'Exported classes need a short leading block comment.',
      },
    ],
  },
  {
    find: 'src/**/*.ts/**/class/public/function',
    recommendation: 'Public class methods are part of this fixture contract.',
    traverse: [
      {
        find: '$prev-sibling',
        assert: { type: 'token:block-comment', contains: '/**', tokenLineLength: { min: 3 } },
        recommendation: 'Public class methods need a short leading JSDoc block.',
      },
    ],
  },
  {
    find: 'src/missing.ts',
    assert: { exists: false },
    recommendation: 'The missing marker file should stay absent.',
  },
];

const traversalPropertyStructureRuleFind = [
  {
    find: 'src/**/*.ts/import',
    assert: { exists: true, type: 'token:import', importPath: 'node:fs/promises' },
  },
  {
    find: 'src/**/*.ts/block-comment',
    assert: { exists: true, commentContent: { contains: 'example service' } },
  },
  {
    find: 'src/**/*.ts/export/class/public/function',
    assert: { exists: true, type: 'token:function', functionKind: 'method', async: false },
  },
  {
    find: 'src/**/*.ts/export/function',
    assert: { exists: true, type: 'token:function', functionKind: 'declaration', async: true },
  },
];

const excludedStructureRuleFind = [
  {
    find: 'src/commented.ts',
    assert: { lines: { max: 1 } },
  },
];

export function passingStructureRuleConfig() {
  return {
    additional: {
      '@rule/structure': {
        find: structureRuleFind,
      },
    },
  };
}

export function traversalPropertyStructureRuleConfig() {
  return {
    additional: {
      '@rule/structure': {
        find: traversalPropertyStructureRuleFind,
      },
    },
  };
}

export function excludedStructureRuleConfig() {
  return {
    exclude: [
      {
        rules: ['@rule/structure'],
        paths: ['src/commented.ts'],
        justification: 'The excluded fixture intentionally violates this focused structure assertion.',
      },
    ],
    additional: {
      '@rule/structure': {
        find: excludedStructureRuleFind,
      },
    },
  };
}
