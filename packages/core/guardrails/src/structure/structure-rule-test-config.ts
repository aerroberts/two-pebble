const structureRuleFind = [
  {
    find: 'src/**/*.ts',
    rules: {
      type: 'file',
      fileName: { endsWith: '.ts' },
      contains: ['export', 'ExampleService'],
      missing: ['forbidden', 'deprecated'],
    },
    recommendation: 'Structure fixtures should only contain exported TypeScript examples.',
  },
  {
    find: 'src/**/*.ts/export/class',
    rules: { exists: true, type: 'token:class' },
    recommendation: 'Exported classes are part of this fixture contract.',
    traverse: [
      {
        find: '$prev-sibling',
        rules: { type: 'token:block-comment', tokenLineLength: { min: 3, max: 4 } },
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
        rules: { type: 'token:block-comment', contains: '/**', tokenLineLength: { min: 3 } },
        recommendation: 'Public class methods need a short leading JSDoc block.',
      },
    ],
  },
  {
    find: 'src/missing.ts',
    rules: { exists: false },
    recommendation: 'The missing marker file should stay absent.',
  },
];

const traversalPropertyStructureRuleFind = [
  {
    find: 'src/**/*.ts/import',
    rules: { exists: true, type: 'token:import', importPath: 'node:fs/promises' },
  },
  {
    find: 'src/**/*.ts/block-comment',
    rules: { exists: true, commentContent: { contains: 'example service' } },
  },
  {
    find: 'src/**/*.ts/export/class/public/function',
    rules: { exists: true, type: 'token:function', functionKind: 'method', async: false },
  },
  {
    find: 'src/**/*.ts/export/function',
    rules: { exists: true, type: 'token:function', functionKind: 'declaration', async: true },
  },
];

const excludedStructureRuleFind = [
  {
    find: 'src/commented.ts',
    rules: { lines: { max: 1 } },
  },
];

const topLevelStructureRuleFind = [
  {
    find: 'src/**/*.test.ts',
    traverse: [
      {
        find: ['import', 'describe', 'block-comment', 'line-comment'],
        invert: true,
        rules: { exists: false },
        recommendation: 'Test files may only contain imports and top-level describe blocks.',
      },
      {
        find: ['**/class', '**/function', '**/interface', '**/type'],
        rules: { exists: false },
        recommendation: 'Test files must not define nested support declarations.',
      },
    ],
  },
  {
    find: 'src/**/index.ts',
    traverse: [
      {
        find: ['import', 're-export', 'block-comment', 'line-comment'],
        invert: true,
        rules: { exists: false },
        recommendation: 'Index files may only import and re-export modules.',
      },
    ],
  },
  {
    find: 'src/**/types.ts',
    traverse: [
      {
        find: [
          'import',
          're-export',
          'interface',
          'type',
          'export/interface',
          'export/type',
          'block-comment',
          'line-comment',
        ],
        invert: true,
        rules: { exists: false },
        recommendation: 'Types files may only contain imports, type contracts, and re-exports.',
      },
    ],
  },
  {
    find: ['src/**/*.ts/class', 'src/**/*.ts/export/class'],
    exclude: ['**/*.test.ts'],
    traverse: [
      {
        find: [
          '$siblings/import',
          '$siblings/class',
          '$siblings/export/class',
          '$siblings/block-comment',
          '$siblings/line-comment',
        ],
        invert: true,
        rules: { exists: false },
        recommendation: 'Class files may only contain imports and classes.',
      },
    ],
  },
];

export function passingStructureRuleConfig() {
  return {
    rules: structureRuleFind,
  };
}

export function traversalPropertyStructureRuleConfig() {
  return {
    rules: traversalPropertyStructureRuleFind,
  };
}

export function excludedStructureRuleConfig() {
  return {
    exclude: [
      {
        rules: ['structure'],
        paths: ['src/commented.ts'],
        justification: 'The excluded fixture intentionally violates this focused structure rule.',
      },
    ],
    rules: excludedStructureRuleFind,
  };
}

export function topLevelStructureRuleConfig() {
  return {
    rules: topLevelStructureRuleFind,
  };
}
