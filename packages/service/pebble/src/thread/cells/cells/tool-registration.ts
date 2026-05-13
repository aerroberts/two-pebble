import type { AgentToolType } from '../../../agent/tools/types';

export interface ToolRegistrationCellInput {
  name: string;
  description: string;
  toolType: AgentToolType;
  /**
   * JSON Schema describing the tool input. Required for native tools so
   * providers can register them with the model API; absent for tool kinds
   * whose registration is purely textual.
   */
  inputSchema?: object;
}

export function toolRegistration(input: ToolRegistrationCellInput) {
  return {
    type: 'toolRegistration' as const,
    content: { ...input },
  };
}
