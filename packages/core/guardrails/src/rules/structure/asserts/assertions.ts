import { AsyncAssertion } from './async-assertion';
import { CommentContentAssertion } from './comment-content-assertion';
import { ContainsAssertion } from './contains-assertion';
import { ExistsAssertion } from './exists-assertion';
import { FileNameAssertion } from './file-name-assertion';
import { FunctionKindAssertion } from './function-kind-assertion';
import { ImportPathAssertion } from './import-path-assertion';
import { MissingAssertion } from './missing-assertion';
import { TokenCharLengthAssertion } from './token-char-length-assertion';
import { TokenLineLengthAssertion } from './token-line-length-assertion';
import { TypeAssertion } from './type-assertion';

export function structureAssertions() {
  return [
    new ExistsAssertion(),
    new TypeAssertion(),
    new AsyncAssertion(),
    new FunctionKindAssertion(),
    new ImportPathAssertion(),
    new CommentContentAssertion(),
    new FileNameAssertion(),
    new ContainsAssertion(),
    new MissingAssertion(),
    new TokenLineLengthAssertion(),
    new TokenCharLengthAssertion(),
  ];
}
