import { Assert as AllowedImportPathAssertion } from './asserts/allowed-import-path/assert';
import { Assert as AsyncAssertion } from './asserts/async/assert';
import { Assert as CommentContentAssertion } from './asserts/comment-content/assert';
import { Assert as ContainsAssertion } from './asserts/contains/assert';
import { Assert as ExistsAssertion } from './asserts/exists/assert';
import { Assert as FileNameAssertion } from './asserts/file-name/assert';
import { Assert as FunctionKindAssertion } from './asserts/function-kind/assert';
import { Assert as ImportPathAssertion } from './asserts/import-path/assert';
import { Assert as LinesAssertion } from './asserts/lines/assert';
import { Assert as MatchesFileNameAssertion } from './asserts/matches-file-name/assert';
import { Assert as MissingAssertion } from './asserts/missing/assert';
import { Assert as TokenCharLengthAssertion } from './asserts/token-char-length/assert';
import { Assert as TokenLineLengthAssertion } from './asserts/token-line-length/assert';
import { Assert as TypeAssertion } from './asserts/type/assert';

export function structureAssertions() {
  return [
    new ExistsAssertion(),
    new TypeAssertion(),
    new AllowedImportPathAssertion(),
    new AsyncAssertion(),
    new FunctionKindAssertion(),
    new ImportPathAssertion(),
    new CommentContentAssertion(),
    new FileNameAssertion(),
    new MatchesFileNameAssertion(),
    new ContainsAssertion(),
    new MissingAssertion(),
    new LinesAssertion(),
    new TokenLineLengthAssertion(),
    new TokenCharLengthAssertion(),
  ];
}
