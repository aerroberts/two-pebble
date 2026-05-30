# @two-pebble/traversal

Code traversal builds a cached tree of filesystem records and translated TypeScript syntax records. Callers use
`CodeTraversal` to find files or AST nodes with path-like query strings.

## usage example

```typescript
import { CodeTraversal } from '@two-pebble/traversal';

// Pass the absolute file or directory path that should become the traversal root.
// The default cache is written to <root>/.traversal for directory roots.
const traversal = new CodeTraversal('/absolute/path/to/package');

// The first call expands the tree. Follow-up calls reuse memory and disk cache.
const exportedFunctions = await traversal.find('src/**/*.ts#export/function');
```

## API

- `new CodeTraversal(root)` — build a traversal rooted at an absolute file or directory path.
- `find(query)` — resolve a path-like query (e.g. `src/**/*.ts#export/function`) to file or AST records, expanding and caching the tree on first use.
