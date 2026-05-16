import { agentSystemPromptFromText } from '@two-pebble/datatypes';

export const sampleAgentRegistryInput = {
  inferenceProfileId: 'profile-1',
  name: 'Sample Agent',
  systemPrompt: agentSystemPromptFromText('You are a helpful assistant.'),
};

export const sampleRepositoryInput = {
  baseBranch: 'main',
  name: 'Sample',
  path: '/tmp/sample',
};

export const sampleWorktreeInput = {
  branch: 'feature',
  path: '/tmp/sample/worktree',
};

export const sampleWorkspaceInput = {
  path: '/tmp/workspace',
  worktreeId: null,
};

export const firstAgentInput = {
  description: 'First generated id agent',
  name: 'First Agent',
  workspaceId: 'legacy',
};
export const secondAgentInput = {
  description: 'Second generated id agent',
  name: 'Second Agent',
  workspaceId: 'legacy',
};
export const callListAgentInput = { description: 'Call list agent', name: 'Call List Agent', workspaceId: 'legacy' };
export const callReadAgentInput = { description: 'Call read agent', name: 'Call Read Agent', workspaceId: 'legacy' };
export const callRecordAgentInput = {
  description: 'Call record agent',
  name: 'Call Record Agent',
  workspaceId: 'legacy',
};

export const callListInput = {
  completedAt: 105,
  data: { visible: false },
  errorMessage: '',
  id: 'model-call-list',
  modelId: 'gpt-list',
  provider: 'openai',
  startedAt: 100,
  status: 'completed' as const,
  threadCellPointer: 'thread-list:1',
};

export const callReadInput = {
  completedAt: 205,
  data: { hidden: true },
  errorMessage: '',
  id: 'model-call-read',
  modelId: 'gpt-read',
  provider: 'openai',
  startedAt: 200,
  status: 'completed' as const,
  threadCellPointer: 'thread-read:1',
};

export const callRecordInput = {
  completedAt: 305,
  data: { tokens: 42 },
  errorMessage: '',
  id: 'model-call-record',
  modelId: 'gpt-record',
  provider: 'openai',
  startedAt: 300,
  status: 'completed' as const,
  threadCellPointer: 'thread-record:1',
};

export const conversationCellAgentInput = {
  description: 'Conversation cell agent',
  name: 'Conversation Cell Agent',
  workspaceId: 'legacy',
};
export const conversationCellRecordInput = {
  orderId: 1,
  content: [{ type: 'text' as const, content: { text: 'hello' } }],
  label: 'User Message',
  role: 'user' as const,
  threadId: 'thread-test',
};

export const traceListAgentInput = {
  description: 'Trace list agent',
  name: 'Trace List Agent',
  workspaceId: 'legacy',
};
export const traceRecordAgentInput = {
  description: 'Trace record agent',
  name: 'Trace Record Agent',
  workspaceId: 'legacy',
};
export const traceListInput = {
  data: { content: [{ type: 'text' as const, content: { text: 'Trace list message' } }] },
  id: 'trace-list',
  orderId: 1,
  type: 'user-message' as const,
};
export const traceRecordInput = {
  data: { content: [{ type: 'text' as const, content: { text: 'Trace record message' } }] },
  id: 'trace-record',
  orderId: 7,
  type: 'user-message' as const,
};

export const openAiCreateInput = {
  data: { apiKey: 'sk-test' },
  name: 'OpenAI',
  provider: 'openai' as const,
};
export const openAiDeleteInput = {
  data: { apiKey: 'sk-delete' },
  name: 'OpenAI',
  provider: 'openai' as const,
};
export const openAiListInput = {
  data: { apiKey: 'sk-list' },
  name: 'OpenAI',
  provider: 'openai' as const,
};
export const ollamaReadInput = {
  data: { baseUrl: 'http://localhost:11434' },
  name: 'Ollama',
  provider: 'ollama' as const,
};
export const openAiUpdateCreateInput = {
  data: { apiKey: 'sk-old' },
  name: 'OpenAI',
  provider: 'openai' as const,
};
export const openAiUpdateInput = {
  data: { apiKey: 'sk-test' },
  name: 'OpenAI',
  provider: 'openai' as const,
};
export const wrongProviderUpdateInput = {
  data: { apiKey: 'sk-wrong-provider' },
  name: 'OpenAI',
  provider: 'openai' as const,
};

export const openAiInferenceProfileInput = {
  data: { model: 'gpt-test' },
  kind: 'intelligence' as const,
  name: 'OpenAI GPT',
  provider: 'openai' as const,
};
export const openAiInferenceProfileUpdateInput = {
  data: { model: 'gpt-updated' },
  kind: 'intelligence' as const,
  name: 'OpenAI GPT Updated',
  provider: 'openai' as const,
};

export const claudeCodeInstallCreateInput = {
  data: { executablePath: '/usr/local/bin/claude' },
  frameworkId: 'claude-code' as const,
  name: 'Claude Code',
};
export const claudeCodeInstallDeleteInput = {
  data: { executablePath: '/usr/local/bin/claude' },
  frameworkId: 'claude-code' as const,
  name: 'Claude Code Delete',
};
export const claudeCodeInstallListInput = {
  data: { executablePath: '/usr/local/bin/claude' },
  frameworkId: 'claude-code' as const,
  name: 'Claude Code List',
};
export const claudeCodeInstallUpdateCreateInput = {
  data: { executablePath: '/usr/local/bin/claude' },
  frameworkId: 'claude-code' as const,
  name: 'Claude Code Old',
};
export const claudeCodeInstallUpdateInput = {
  data: { executablePath: '/usr/local/bin/claude-new' },
  frameworkId: 'claude-code' as const,
  name: 'Claude Code New',
};
