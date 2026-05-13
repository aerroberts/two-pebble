export const expectedFailureSummary = {
  errors: [
    'wrong-path-type',
    'missing-content',
    'missing-path',
    'forbidden-content',
    'missing-content',
    'forbidden-import',
    'wrong-file-name',
    'missing-exhaustive-content',
  ],
  files: [
    'src/domain/bad/test',
    'src/domain/test/example.ts',
    'src/features/missing',
    'src/features/user/user.md',
    'src/features/user/user.md',
    'src/protocol/importing.ts',
    'src/protocol/readme.md',
    'src/tests/operations.test.ts',
  ],
};
