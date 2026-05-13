import type { DiagnosticMap } from '../../types';

export const classNameErrors: DiagnosticMap = {
  'class-name': {
    description:
      'Class names must match the configured classNamePattern because classes represent named concepts, not loose module utilities or values.',
    recommendation: 'Rename the class to match the configured naming convention and describe the object it owns.',
  },
  'class-file-name': {
    description:
      'A class file name must match the configured fileNameCase form of the class name so navigation is predictable without opening the file.',
    recommendation:
      'Rename the file to match the class. One class should have one obvious file, and the file path should make the class easy to find from memory.',
  },
};
