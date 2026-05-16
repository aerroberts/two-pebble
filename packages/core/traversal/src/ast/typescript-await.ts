import ts from 'typescript';
import type { TraversalNodeRecord } from '../types';
import { typescriptNodeUtils } from './typescript-node-utils';
import { typescriptTokenRecords } from './typescript-token-records';

export function awaitExpressionRecords(sourceFile: ts.SourceFile, node: ts.Node, records: TraversalNodeRecord[]) {
  const awaitIds: string[] = [];
  const visit = (candidate: ts.Node) => {
    if (candidate !== node && typescriptNodeUtils.isFunctionLike(candidate)) {
      return;
    }
    if (ts.isAwaitExpression(candidate)) {
      awaitIds.push(
        typescriptTokenRecords.createTokenRecord(records, {
          sourceFile,
          node: candidate,
          token: 'await',
          name: 'await',
          childIds: [],
        }).id,
      );
    }

    candidate.forEachChild(visit);
  };

  visit(node);
  return awaitIds;
}
