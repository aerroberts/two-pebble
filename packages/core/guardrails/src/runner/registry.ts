import { Rule as ClassNameRule } from '../rules/class-name/rule';
import { Rule as CodeStructureRule } from '../rules/code-structure/rule';
import { Rule as IndentRule } from '../rules/indent/rule';
import { Rule as ReactExportedComponentRule } from '../rules/react-exported-component/rule';
import { Rule as ReactFunctionParameterRule } from '../rules/react-function-parameter/rule';
import { Rule as ReactJsxStyleRule } from '../rules/react-jsx-style/rule';
import { Rule as StructureRule } from '../rules/structure/rule';
import { Rule as TestCaseStructureRule } from '../rules/test-case-structure/rule';
import { Rule as TestConstOrderRule } from '../rules/test-const-order/rule';
import { Rule as TestDescribeStructureRule } from '../rules/test-describe-structure/rule';
import { Rule as TestHookRule } from '../rules/test-hook/rule';
import { Rule as TestMockRule } from '../rules/test-mock/rule';
import { Rule as TypescriptFunctionShapeRule } from '../rules/typescript-function-shape/rule';
import { Rule as TypescriptReExportOnlyFileRule } from '../rules/typescript-re-export-only-file/rule';
import { Rule as TypescriptTypeSafetyRule } from '../rules/typescript-type-safety/rule';
import { Rule as TypescriptVariableTypeRule } from '../rules/typescript-variable-type/rule';
import type { RuleRegistration } from './types';

export const rules: RuleRegistration[] = [
  {
    name: 'class-name',
    create: (context) => new ClassNameRule(context),
  },
  {
    name: 'react-exported-component',
    create: (context) => new ReactExportedComponentRule(context),
  },
  {
    name: 'react-jsx-style',
    create: (context) => new ReactJsxStyleRule(context),
  },
  {
    name: 'react-function-parameter',
    create: (context) => new ReactFunctionParameterRule(context),
  },
  {
    name: 'test-const-order',
    create: (context) => new TestConstOrderRule(context),
  },
  {
    name: 'test-describe-structure',
    create: (context) => new TestDescribeStructureRule(context),
  },
  {
    name: 'test-case-structure',
    create: (context) => new TestCaseStructureRule(context),
  },
  {
    name: 'test-hook',
    create: (context) => new TestHookRule(context),
  },
  {
    name: 'test-mock',
    create: (context) => new TestMockRule(context),
  },
  {
    name: 'indent',
    create: (context) => new IndentRule(context),
  },
  {
    name: 'typescript-re-export-only-file',
    create: (context) => new TypescriptReExportOnlyFileRule(context),
  },
  {
    name: 'typescript-type-safety',
    create: (context) => new TypescriptTypeSafetyRule(context),
  },
  {
    name: 'typescript-function-shape',
    create: (context) => new TypescriptFunctionShapeRule(context),
  },
  {
    name: 'typescript-variable-type',
    create: (context) => new TypescriptVariableTypeRule(context),
  },
  {
    name: 'code-structure',
    create: (context) => new CodeStructureRule(context),
  },
  {
    name: 'structure',
    create: (context) => new StructureRule(context),
  },
];
