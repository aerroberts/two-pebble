import type { TraversalNode } from '@two-pebble/traversal';
import type { StructureRuleAssertions, StructureRuleFailure, StructureStringRuleConfig } from '../types';

/**
 * Base class for one rule against a selected structure node set.
 * Implementations own exactly one rule key.
 */
export abstract class StructureRule<TValue> {
  public abstract readonly key: keyof StructureRuleAssertions;

  /**
   * Evaluates this rule against every selected node.
   * Callers receive structured failures instead of diagnostics.
   */
  public evaluate(nodes: TraversalNode[], value: TValue) {
    if (nodes.length === 0) {
      return this.evaluateEmpty(value);
    }

    return nodes.flatMap((node) => {
      try {
        return this.evaluateNode(node, value);
      } catch (error) {
        return [this.failure(node, error instanceof Error ? error.message : String(error))];
      }
    });
  }

  protected evaluateEmpty(_value: TValue): StructureRuleFailure[] {
    return [this.failure(undefined, `Expected at least one node for ${String(this.key)} rule.`)];
  }

  protected abstract evaluateNode(node: TraversalNode, value: TValue): StructureRuleFailure[];

  protected failure(node: TraversalNode | undefined, message: string): StructureRuleFailure {
    return { node, rule: String(this.key), message };
  }

  protected stringProperty(node: TraversalNode, name: string) {
    const value = node.property(name);
    if (typeof value !== 'string') {
      throw new Error(`Expected string property ${name}.`);
    }
    return value;
  }

  protected numberProperty(node: TraversalNode, name: string) {
    const value = node.property(name);
    if (typeof value !== 'number') {
      throw new Error(`Expected number property ${name}.`);
    }
    return value;
  }

  protected stringExpectationFailures(input: {
    node: TraversalNode;
    actual: string;
    value: string | StructureStringRuleConfig;
    label: string;
  }) {
    const config = typeof input.value === 'string' ? { equals: input.value } : input.value;
    const failures: StructureRuleFailure[] = [];
    if (config.equals !== undefined && input.actual !== config.equals) {
      failures.push(this.failure(input.node, `Expected ${input.label} ${config.equals}.`));
    }
    if (config.contains !== undefined && !input.actual.includes(config.contains)) {
      failures.push(this.failure(input.node, `Expected ${input.label} to contain ${config.contains}.`));
    }
    if (config.missing !== undefined && input.actual.includes(config.missing)) {
      failures.push(this.failure(input.node, `Expected ${input.label} to omit ${config.missing}.`));
    }
    if (config.startsWith !== undefined && !input.actual.startsWith(config.startsWith)) {
      failures.push(this.failure(input.node, `Expected ${input.label} to start with ${config.startsWith}.`));
    }
    if (config.endsWith !== undefined && !input.actual.endsWith(config.endsWith)) {
      failures.push(this.failure(input.node, `Expected ${input.label} to end with ${config.endsWith}.`));
    }
    return failures;
  }
}
