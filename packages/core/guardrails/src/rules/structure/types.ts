import type { TraversalFunctionKind, TraversalNode, TraversalNodeType } from '@two-pebble/traversal';
import type { RuleConfig } from '../../types';

export type StructureAssertionErrorId = 'structure-assertion-failed';

export interface StructureConfig extends RuleConfig {
  find?: Record<string, StructureRuleConfig> | StructureFindRuleConfig[];
  cacheDirectory?: string;
}

export interface StructureFindRuleConfig extends StructureRuleConfig {
  find: string;
}

export interface StructureRuleConfig {
  assert?: StructureAssertConfig;
  recommendation?: string;
  recommendations?: string;
  recomendations?: string;
  traverse?: StructureFindRuleConfig[];
}

export interface StructureAssertConfig {
  exists?: boolean;
  type?: TraversalNodeType;
  async?: boolean;
  functionKind?: TraversalFunctionKind;
  importPath?: string | StructureStringAssertConfig;
  commentContent?: string | StructureStringAssertConfig;
  fileName?: string | StructureFileNameAssertConfig;
  contains?: string | string[];
  missing?: string | string[];
  tokenLineLength?: StructureRangeAssertConfig;
  tokenCharLength?: StructureRangeAssertConfig;
}

export interface StructureStringAssertConfig {
  contains?: string;
  endsWith?: string;
  equals?: string;
  missing?: string;
  startsWith?: string;
}

export interface StructureFileNameAssertConfig {
  equals?: string;
  endsWith?: string;
  startsWith?: string;
}

export interface StructureRangeAssertConfig {
  min?: number;
  max?: number;
}

export interface StructureAssertionFailure {
  node?: TraversalNode;
  assertion: string;
  message: string;
}
