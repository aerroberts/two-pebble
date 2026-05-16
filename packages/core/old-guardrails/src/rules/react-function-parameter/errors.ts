import type { DiagnosticMap } from '../../types';

export const reactFunctionParameterErrors: DiagnosticMap = {
  'destructured-function-parameter': {
    description:
      'React function signatures must not destructure object parameters when allowDestructuredFunctionParameters is false. Destructuring hides the props object and makes later changes look smaller than they are.',
    recommendation:
      'Define a props interface near the top of the file, accept a single props parameter, and read values as props.name. The component contract stays named and usage remains explicit.',
  },
  'complex-signature-type': {
    description:
      'React function signatures must not define complex inline parameter or return types. Inline object and function shapes hide component contracts inside implementation details.',
    recommendation:
      'Move the shape to a named props interface or type near the top of the file, and use simple references in the function signature.',
  },
};
