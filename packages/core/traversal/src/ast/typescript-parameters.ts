import ts from 'typescript';
import type { TraversalNodeRecord } from '../types';
import { typescriptTokenRecords } from './typescript-token-records';

type ParameterOwnerNode =
  | ts.FunctionDeclaration
  | ts.FunctionExpression
  | ts.ArrowFunction
  | ts.MethodDeclaration
  | ts.ConstructorDeclaration
  | ts.GetAccessorDeclaration
  | ts.SetAccessorDeclaration;

export function parametersRecord(sourceFile: ts.SourceFile, node: ParameterOwnerNode, records: TraversalNodeRecord[]) {
  const childIds = parameterRecords(sourceFile, node.parameters, records);
  const range = parameterListRange(sourceFile, node);
  return typescriptTokenRecords.createTokenRecord(records, {
    sourceFile,
    node,
    token: 'parameters',
    name: 'parameters',
    start: range.start,
    end: range.end,
    childIds,
  });
}

function parameterRecords(
  sourceFile: ts.SourceFile,
  parameters: ts.NodeArray<ts.ParameterDeclaration>,
  records: TraversalNodeRecord[],
) {
  return parameters.map((parameter) => {
    return typescriptTokenRecords.createTokenRecord(records, {
      sourceFile,
      node: parameter,
      token: 'parameter',
      name: parameter.name.getText(sourceFile),
      destructured: isDestructuredParameter(parameter),
      childIds: parameterBindingRecords(sourceFile, parameter.name, records),
    }).id;
  });
}

function parameterListRange(sourceFile: ts.SourceFile, node: ParameterOwnerNode) {
  if (node.parameters.length > 0) {
    const first = node.parameters[0];
    const last = node.parameters[node.parameters.length - 1];
    return { start: first.getStart(sourceFile), end: last.getEnd() };
  }

  const start = node.getStart(sourceFile);
  return { start, end: start };
}

function isDestructuredParameter(parameter: ts.ParameterDeclaration) {
  return ts.isObjectBindingPattern(parameter.name) || ts.isArrayBindingPattern(parameter.name);
}

function parameterBindingRecords(
  sourceFile: ts.SourceFile,
  name: ts.BindingName,
  records: TraversalNodeRecord[],
): string[] {
  if (ts.isObjectBindingPattern(name)) {
    return name.elements.map((element) => parameterBindingRecord(sourceFile, element, undefined, records).id);
  }
  if (ts.isArrayBindingPattern(name)) {
    return name.elements.flatMap((element, index) => {
      if (!ts.isBindingElement(element)) {
        return [];
      }
      return [parameterBindingRecord(sourceFile, element, String(index), records).id];
    });
  }

  return [];
}

function parameterBindingRecord(
  sourceFile: ts.SourceFile,
  node: ts.BindingElement,
  propertyName: string | undefined,
  records: TraversalNodeRecord[],
): TraversalNodeRecord {
  return typescriptTokenRecords.createTokenRecord(records, {
    sourceFile,
    node,
    token: 'parameter-binding',
    name: node.name.getText(sourceFile),
    propertyName: node.propertyName?.getText(sourceFile) ?? propertyName ?? node.name.getText(sourceFile),
    childIds: parameterBindingRecords(sourceFile, node.name, records),
  });
}
