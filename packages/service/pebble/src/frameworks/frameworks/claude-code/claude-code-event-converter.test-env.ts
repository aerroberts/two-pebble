export function assistantTextMessage(content: string) {
  return {
    type: 'assistant',
    message: { content: [{ type: 'text', text: content }] },
  } as never;
}

export function assistantThinkingMessage(content: string) {
  return {
    type: 'assistant',
    message: { content: [{ type: 'thinking', thinking: content }] },
  } as never;
}

export function assistantToolUseMessage(callId: string, toolId: string) {
  return {
    type: 'assistant',
    message: { content: [{ type: 'tool_use', id: callId, name: toolId, input: {} }] },
  } as never;
}

export function assistantTodoWriteMessage(callId: string) {
  const input = {
    todos: [
      { content: 'First task', status: 'in_progress', activeForm: 'Doing first' },
      { content: 'Second task', status: 'pending', activeForm: 'Will do second' },
      { content: 'Third task', status: 'completed', activeForm: 'Did third' },
    ],
  };
  const block = { type: 'tool_use', id: callId, name: 'TodoWrite', input };
  return { type: 'assistant', message: { content: [block] } } as never;
}

export function assistantTextMessageFor(agentId: string, agentType: string, content: string) {
  return {
    type: 'assistant',
    agent_id: agentId,
    agent_type: agentType,
    message: { content: [{ type: 'text', text: content }] },
  } as never;
}

export function successResultMessage(result: string, modelId: string) {
  return {
    type: 'result',
    subtype: 'success',
    result,
    modelUsage: {
      [modelId]: { inputTokens: 1, outputTokens: 4, cacheReadInputTokens: 2, cacheCreationInputTokens: 3 },
    },
  } as never;
}

export const DEFAULT_TEST_MODEL_ID = 'anthropic/claude-opus-4-7';

export function subagentStartHookInput(agentId: string, agentType: string) {
  return { hook_event_name: 'SubagentStart', agent_id: agentId, agent_type: agentType } as never;
}

export function subagentStopHookInput(agentId: string, agentType: string, path: string) {
  return {
    hook_event_name: 'SubagentStop',
    agent_id: agentId,
    agent_type: agentType,
    agent_transcript_path: path,
  } as never;
}

export const successTranscript = [
  JSON.stringify({ type: 'user', message: { content: 'Inspect pricing.' } }),
  JSON.stringify({ type: 'assistant', message: { content: [{ type: 'text', text: 'Pricing inspected.' }] } }),
  JSON.stringify({
    type: 'result',
    subtype: 'success',
    result: 'Pricing inspected.',
    modelUsage: {
      'anthropic/claude-opus-4-7': {
        inputTokens: 10,
        outputTokens: 20,
        cacheReadInputTokens: 30,
        cacheCreationInputTokens: 40,
      },
    },
  }),
].join('\n');
