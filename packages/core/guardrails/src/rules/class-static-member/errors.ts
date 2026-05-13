import type { DiagnosticMap } from '../../types';

export const classStaticMemberErrors: DiagnosticMap = {
  'static-class-member': {
    description:
      'Class files must not define static members when allowStaticMembers is false. Static class APIs blur the line between object behavior and module-level utility behavior.',
    recommendation:
      'Move factory helpers, constants, and stateless functions out of the class file. Keep classes focused on instance state and instance behavior.',
  },
};
