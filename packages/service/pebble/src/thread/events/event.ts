import { agentMessage } from './events/agent-message';
import { agentNamingInstruction } from './events/agent-naming-instruction';
import { customToolParsingFormat } from './events/custom-tool-parsing-format';
import { incomingMessage } from './events/incoming-message';
import { systemPrompt } from './events/system-prompt';
import { toolDeregistration } from './events/tool-deregistration';
import { toolInvokeResult } from './events/tool-invoke-result';
import { userMessage } from './events/user-message';

export const Event = {
  agentMessage,
  agentNamingInstruction,
  customToolParsingFormat,
  incomingMessage,
  systemPrompt,
  toolDeregistration,
  toolInvokeResult,
  userMessage,
};
