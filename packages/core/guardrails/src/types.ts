/**
 * Parsed shape of a code.guard file. Captures the optional inheritance link
 * and the structure-rule list the runner will evaluate.
 */
export interface GuardrailConfig {
  definition?: string;
  inherit?: string | string[];
  structure?: StructureRule[];
}

/**
 * A single top-level entry in the `structure` array. Matches files (or other
 * workspace nodes) via `find`, optionally subtracts an `exclude` set, runs the
 * declared `asserts`, then runs each nested `code` rule scoped to every file
 * the find produced.
 */
export interface StructureRule {
  find: string | string[];
  exclude?: string | string[];
  recommendation?: string;
  asserts?: AssertConfig;
  code?: CodeRule[];
  ref?: RefDeclaration;
}

/**
 * Declares the find result of a structure rule as a named variable. Each
 * matched node is reduced to a string key by reading the `extract` data
 * field; downstream rules can then reference the set of keys by `name`
 * through a `map` assertion.
 */
export interface RefDeclaration {
  name: string;
  extract: string;
}

/**
 * A per-file AST check nested under a structure rule. `find` is interpreted as
 * an AST query (no glob prefix) and runs inside each file matched by the
 * parent rule.
 */
export interface CodeRule {
  find: string | string[];
  exclude?: string | string[];
  asserts?: AssertConfig;
  recommendation?: string;
}

/**
 * The set of assertions a rule can declare. Each key maps to a file in
 * `src/asserts/` whose `validate` function evaluates the matched nodes.
 */
export interface AssertConfig {
  exists?: boolean;
  type?: string;
  named?: string;
  startsWith?: StartsWithAssert;
  matches?: NumberRange;
  lines?: NumberRange;
  content?: ContentAssert;
  map?: MapAssert;
}

/**
 * String-prefix assertion for AST node metadata. Defaults to the `name`
 * property because most semantic nodes expose their human label there.
 */
export interface StartsWithAssert {
  property?: string;
  values: string | string[];
}

/**
 * Cross-ref set comparison. Both `fromRef` and `toRef` name previously
 * declared refs (see RefDeclaration) — typically one declared on an earlier
 * rule and one declared on this rule. `method` controls how a fromRef value
 * is paired with a toRef value:
 *   - "equals":    fromRef value === toRef value
 *   - "substring": fromRef value appears anywhere inside toRef value
 * The booleans then turn the pairing into a coverage claim:
 *   - fullyConsumes: every fromRef value participates in at least one pair
 *   - fullyCovers:   every toRef value participates in at least one pair
 */
export interface MapAssert {
  fromRef: string;
  toRef: string;
  method?: 'equals' | 'substring';
  fullyConsumes?: boolean;
  fullyCovers?: boolean;
}

/**
 * String-prefix assertion for AST node metadata. Defaults to the `name`
 * property because most semantic nodes expose their human label there.
 */
export interface StartsWithAssert {
  property?: string;
  values: string | string[];
}

/**
 * Raw-text assertion for file nodes. `includes` strings must all appear in the
 * file's content; `lacks` strings must all be absent.
 */
export interface ContentAssert {
  includes?: string[];
  lacks?: string[];
}

/**
 * String literal union over the supported assertion names. Derived from
 * `AssertConfig` so adding a new key here adds a new assertion slot.
 */
export type AssertName = keyof AssertConfig;

/**
 * The result returned by an assertion's `validate` function. A failed outcome
 * carries a human-readable description used in the diagnostic.
 */
export interface AssertOutcome {
  passed: boolean;
  description?: string;
}

/**
 * Range constraint used by count-shaped and span-shaped assertions. Each
 * field is independently optional; the runner enforces the ones that are set.
 */
export interface NumberRange {
  exactly?: number;
  min?: number;
  max?: number;
}

/**
 * A single assertion failure. Carries the offending rule's `find`, the
 * assertion that failed, and the stack-trace style recommendation built from
 * leading comments and rule recommendations.
 */
export interface Diagnostic {
  recommendation: string;
  description: string;
  find: string;
  assertion: string;
  file?: string;
}

/**
 * The per-rule outcome the runner emits. Aggregates diagnostics for a single
 * (rule, file?) pair so the reporter can group output.
 */
export interface CheckResult {
  find: string;
  recommendation: string;
  passed: boolean;
  diagnostics: Diagnostic[];
  durationMs: number;
}

/**
 * The top-level result returned by `Controller.run`. Holds every check, the
 * union of files scanned, and the total wall-clock duration.
 */
export interface RunResult {
  passed: boolean;
  results: CheckResult[];
  filesScanned: Set<string>;
  totalDurationMs: number;
}
