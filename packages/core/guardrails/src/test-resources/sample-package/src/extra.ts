export const extra = 'extra';

/**
 * Returns the `extra` constant. Used by the controller tests to confirm the
 * `exclude` filter can drop AST nodes from a code rule's find result.
 */
export function extraHelper() {
  return extra;
}
