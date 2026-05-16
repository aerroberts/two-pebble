import ts from 'typescript';
import type { TraversalNodeRecord } from '../types';
import { isFunctionLike } from './typescript-node-utils';
import { createTokenRecord } from './typescript-token-records';

export function awaitExpressionRecords(sourceFile: ts.SourceFile, node: ts.Node, records: TraversalNodeRecord[]) {
  const awaitIds: string[] = [];
  const visit = (candidate: ts.Node) => {
    if (candidate !== node && isFunctionLike(candidate)) {
      return;
    }
    if (ts.isAwaitExpression(candidate)) {
      awaitIds.push(
        createTokenRecord(records, {
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
