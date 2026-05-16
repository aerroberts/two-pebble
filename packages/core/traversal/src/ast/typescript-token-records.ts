import ts from 'typescript';
import { recordUtils } from '../tree/record-utils';
import type { TraversalNodeRecord, TraversalTokenName, TraversalTokenNodeInput } from '../types';

export const typescriptTokenRecords = {
  createTokenRecord(records: TraversalNodeRecord[], input: TraversalTokenNodeInput) {
    const { sourceFile, node, token, name, async, destructured, functionKind, importPath, propertyName, childIds } =
      input;
    const start = input.start ?? node.getStart(sourceFile);
    const end = input.end ?? node.getEnd();
    const startPosition = sourceFile.getLineAndCharacterOfPosition(start);
    const endPosition = sourceFile.getLineAndCharacterOfPosition(end);
    const record = recordUtils.pushRecord(records, {
      id: '',
      kind: 'token',
      name,
      token,
      async,
      destructured,
      functionKind,
      importPath,
      propertyName,
      path: sourceFile.fileName,
      text: sourceFile.text.slice(start, end),
      line: startPosition.line + 1,
      startLine: startPosition.line + 1,
      startColumn: startPosition.character + 1,
      endLine: endPosition.line + 1,
      endColumn: endPosition.character + 1,
      start,
      end,
      childIds,
    });

    for (const childId of childIds) {
      recordUtils.recordFrom(records, childId).parentId = record.id;
    }

    return record;
  },

  leadingCommentRecords(sourceFile: ts.SourceFile, node: ts.Node, records: TraversalNodeRecord[]) {
    const sourceText = sourceFile.getFullText();
    const comments = ts.getLeadingCommentRanges(sourceText, node.getFullStart()) ?? [];

    return comments.map((comment) => {
      const token: TraversalTokenName =
        comment.kind === ts.SyntaxKind.MultiLineCommentTrivia ? 'block-comment' : 'line-comment';
      const text = sourceText.slice(comment.pos, comment.end);
      const startPosition = sourceFile.getLineAndCharacterOfPosition(comment.pos);
      const endPosition = sourceFile.getLineAndCharacterOfPosition(comment.end);
      return recordUtils.pushRecord(records, {
        id: '',
        kind: 'token',
        name: token,
        token,
        path: sourceFile.fileName,
        text,
        commentContent: commentContent(text, token),
        line: startPosition.line + 1,
        startLine: startPosition.line + 1,
        startColumn: startPosition.character + 1,
        endLine: endPosition.line + 1,
        endColumn: endPosition.character + 1,
        start: comment.pos,
        end: comment.end,
        childIds: [],
      });
    });
  },
};

function commentContent(text: string, token: TraversalTokenName) {
  if (token === 'line-comment') {
    return text
      .split('\n')
      .map((line) => line.replace(/^\s*\/\/\s?/, ''))
      .join('\n')
      .trim();
  }

  return text
    .replace(/^\/\*+/, '')
    .replace(/\*\/$/, '')
    .split('\n')
    .map((line) => line.replace(/^\s*\*\s?/, '').trimEnd())
    .join('\n')
    .trim();
}
