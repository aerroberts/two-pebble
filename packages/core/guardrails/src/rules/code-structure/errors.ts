import type { DiagnosticError, DiagnosticMap } from '../../types';
import type { CodeStructureErrorId, CodeStructureRuleConfig } from './types';

const codeStructureErrors: DiagnosticMap = {
  'missing-path': {
    description:
      'A required path pattern did not resolve to any matching files or directories. Structural rules define the shape of the codebase, so missing paths usually mean a convention was skipped or the feature is incomplete.',
    recommendation: 'Create the missing structure or change the code.guard rule if the convention is no longer true.',
  },
  'forbidden-path': {
    description:
      'A path matched a pattern that this package explicitly forbids. Forbidden paths are used to keep deprecated layouts and confusing alternatives from re-entering the codebase.',
    recommendation:
      'Remove or relocate the matching path, or update code.guard only if the architecture intentionally changed.',
  },
  'wrong-path-type': {
    description:
      'A matched path has the wrong filesystem type. A file and a directory communicate different ownership models, so treating them as interchangeable makes conventions brittle.',
    recommendation:
      'Replace the path with the expected file or directory shape, then keep nested rules attached to the object that actually owns them.',
  },
  'wrong-file-name': {
    description:
      'A matched file does not use the required filename suffix. Naming rules make ownership and test scope visible from the file tree before anyone opens the file.',
    recommendation:
      'Rename the file so it matches the required suffix, or move support code outside the guarded directory.',
  },
  'missing-content': {
    description:
      'A matched file is missing required content. Content checks make documentation and source files carry the markers that explain how the surrounding structure should be used.',
    recommendation:
      'Add the required text to the file, or revise code.guard if the wording requirement no longer expresses the convention.',
  },
  'forbidden-content': {
    description:
      'A matched file contains forbidden content. Exclusion checks keep deprecated markers and architecture shortcuts from returning after a package has moved to a stricter shape.',
    recommendation:
      'Remove the forbidden text from the file, or revise code.guard only if that text is now part of the intended convention.',
  },
  'missing-exhaustive-content': {
    description:
      'Matched files do not collectively contain every value required by an exhaustive content rule. Exhaustive checks connect generated structure, such as operation files, to tests or docs that must cover every discovered case.',
    recommendation:
      'Add coverage for the missing extracted value in one of the matched files, or update code.guard if that extracted set is not the right coverage source.',
  },
  'forbidden-import': {
    description:
      'A matched file imports from a module that is outside the allowed import list. Import checks protect architectural boundaries by making ownership explicit at the file level.',
    recommendation:
      'Remove the import, duplicate the small local type shape when the file must be self-contained, or add the module to allowedImports only when that dependency is part of the intended boundary.',
  },
};

export function codeStructureDiagnostic(error: CodeStructureErrorId, rule: CodeStructureRuleConfig): DiagnosticError {
  const diagnostic = codeStructureErrors[error];

  return {
    error,
    description: diagnostic.description,
    recommendation: `${diagnostic.recommendation} Rule guidance: ${rule.recommendation}`,
  };
}
