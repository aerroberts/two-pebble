import { Rule as AllowedImportPathRule } from './allowed-import-path/rule';
import { Rule as AsyncRule } from './async/rule';
import { Rule as CommentContentRule } from './comment-content/rule';
import { Rule as CommentContentLineLengthRule } from './comment-content-line-length/rule';
import { Rule as ContainsRule } from './contains/rule';
import { Rule as CountRule } from './count/rule';
import { Rule as ExistsRule } from './exists/rule';
import { Rule as FileNameRule } from './file-name/rule';
import { Rule as FunctionKindRule } from './function-kind/rule';
import { Rule as ImportPathRule } from './import-path/rule';
import { Rule as LinesRule } from './lines/rule';
import { Rule as MatchesFileNameRule } from './matches-file-name/rule';
import { Rule as MissingRule } from './missing/rule';
import { Rule as TokenCharLengthRule } from './token-char-length/rule';
import { Rule as TokenLineLengthRule } from './token-line-length/rule';
import { Rule as TypeRule } from './type/rule';

export function structureRules() {
  return [
    new ExistsRule(),
    new TypeRule(),
    new AllowedImportPathRule(),
    new AsyncRule(),
    new FunctionKindRule(),
    new ImportPathRule(),
    new CommentContentRule(),
    new CommentContentLineLengthRule(),
    new FileNameRule(),
    new MatchesFileNameRule(),
    new ContainsRule(),
    new MissingRule(),
    new CountRule(),
    new LinesRule(),
    new TokenLineLengthRule(),
    new TokenCharLengthRule(),
  ];
}
