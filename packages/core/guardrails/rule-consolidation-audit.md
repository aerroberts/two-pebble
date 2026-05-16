# Guardrail Rule Consolidation Audit

## consolidated

- Legacy class, TypeScript, and React file line-count checks became `structure` line-count assertions.
- `typescript-indent` and `react-indent` became `indent`.
- `class-top-level-definition`, `test-file-definition`, and the `index.ts` / `types.ts` statement checks from `typescript-module-role` became `structure` inverted sibling assertions.
- The remaining re-export-only behavior from `typescript-module-role` became `typescript-re-export-only-file`.

## kept separate

- `class-name`: class naming and filename matching is a class-specific AST concern.
- `react-exported-component`: React component export and filename policy is TSX-specific.
- `react-jsx-style`: JSX attribute policy is TSX-specific.
- `react-function-parameter`: React component parameter shape is TSX-specific.
- `test-const-order`: test declaration ordering is distinct from allowed top-level statement kinds.
- `test-describe-structure`: describe naming and nesting is a test-specific AST concern.
- `test-case-structure`: test case naming, nesting, and callback length is a test-specific AST concern.
- `test-hook`: test lifecycle hook bans are a test-specific call-expression concern.
- `test-mock`: mock API bans are a test-specific call-expression concern.
- `typescript-type-safety`: type escape hatch policy is a TypeScript type-node concern.
- `typescript-function-shape`: function body and signature shape is a TypeScript AST concern.
- `typescript-variable-type`: variable type shape is a TypeScript AST concern.
- `code-structure`: filesystem structure policy is not an AST rule.
