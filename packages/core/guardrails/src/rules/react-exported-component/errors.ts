import type { DiagnosticMap } from '../../types';

export const reactExportedComponentErrors: DiagnosticMap = {
  'multiple-exported-functions': {
    description:
      'TSX files may export only the configured maxExportedFunctions count. A React module should have one public component identity so imports and ownership stay obvious.',
    recommendation:
      'Keep the primary exported component in this file and move any other exported component or helper function into its own file with a matching name.',
  },
  'component-file-name': {
    description: 'Exported React function names must match their TSX file names when enforceFileNameMatch is true.',
    recommendation:
      'Rename the file to the component name in kebab case, or rename the exported function to match the file. For example, user-menu.tsx should export UserMenu.',
  },
};
