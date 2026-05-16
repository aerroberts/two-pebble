import type { DiagnosticMap } from '../../types';

export const typescriptFunctionShapeErrors: DiagnosticMap = {
  'too-many-parameters': {
    description:
      'Functions must stay within the configured maxFunctionParameters value. Wide signatures force callers to know too much about implementation details.',
    recommendation:
      'Group related inputs into a named object type or introduce a collaborator that owns the data. Keep function signatures narrow enough to read at the call site.',
  },
  'optional-parameter': {
    description:
      'Function parameters must not be optional when allowOptionalParameters is false. Optional parameters make behavior branch invisibly at the signature boundary.',
    recommendation:
      'Model the branch explicitly with a named input type or split the behavior into separate functions.',
  },
  'default-parameter': {
    description:
      'Function parameters must not define default values when allowDefaultParameters is false. Defaults hide policy inside implementation.',
    recommendation: 'Move defaults to the caller, a named options builder, or a configuration object.',
  },
  'complex-signature-type': {
    description:
      'Function signatures must use simple named types unless allowComplexSignatureTypes is true. Inline object types, function types, and nested generics make contracts hard to scan.',
    recommendation: 'Promote the complex shape into a named type and use that name in the signature.',
  },
};
