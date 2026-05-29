import { agentSystemPromptFromText } from '@two-pebble/datatypes';

/**
 * Exposes this datastore module contract for package-local callers.
 */
export const sampleAgentRegistryInput = {
  inferenceProfileId: 'profile-1',
  name: 'Sample Agent',
  systemPrompt: agentSystemPromptFromText('You are a helpful assistant.'),
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export const sampleRepositoryInput = {
  baseBranch: 'main',
  name: 'Sample',
  path: '/tmp/sample',
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export const sampleWorktreeInput = {
  branch: 'feature',
  path: '/tmp/sample/worktree',
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export const sampleWorkspaceInput = {
  path: '/tmp/workspace',
  worktreeId: null,
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export const firstAgentInput = {
  description: 'First generated id agent',
  name: 'First Agent',
  projectId: 'proj_default',
  workspaceId: 'legacy',
};
/**
 * Exposes this datastore module contract for package-local callers.
 */
export const secondAgentInput = {
  description: 'Second generated id agent',
  name: 'Second Agent',
  projectId: 'proj_default',
  workspaceId: 'legacy',
};
/**
 * Exposes this datastore module contract for package-local callers.
 */
export const callListAgentInput = {
  description: 'Call list agent',
  name: 'Call List Agent',
  projectId: 'proj_default',
  workspaceId: 'legacy',
};
/**
 * Exposes this datastore module contract for package-local callers.
 */
export const callReadAgentInput = {
  description: 'Call read agent',
  name: 'Call Read Agent',
  projectId: 'proj_default',
  workspaceId: 'legacy',
};
/**
 * Exposes this datastore module contract for package-local callers.
 */
export const callRecordAgentInput = {
  description: 'Call record agent',
  name: 'Call Record Agent',
  projectId: 'proj_default',
  workspaceId: 'legacy',
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
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

/**
 * Exposes this datastore module contract for package-local callers.
 */
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

/**
 * Exposes this datastore module contract for package-local callers.
 */
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

/**
 * Exposes this datastore module contract for package-local callers.
 */
export const conversationCellAgentInput = {
  description: 'Conversation cell agent',
  name: 'Conversation Cell Agent',
  projectId: 'proj_default',
  workspaceId: 'legacy',
};
/**
 * Exposes this datastore module contract for package-local callers.
 */
export const conversationCellRecordInput = {
  orderId: 1,
  content: [{ type: 'text' as const, content: { text: 'hello' } }],
  label: 'User Message',
  role: 'user' as const,
  threadId: 'thread-test',
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export const traceListAgentInput = {
  description: 'Trace list agent',
  name: 'Trace List Agent',
  projectId: 'proj_default',
  workspaceId: 'legacy',
};
/**
 * Exposes this datastore module contract for package-local callers.
 */
export const traceRecordAgentInput = {
  description: 'Trace record agent',
  name: 'Trace Record Agent',
  projectId: 'proj_default',
  workspaceId: 'legacy',
};
/**
 * Exposes this datastore module contract for package-local callers.
 */
export const traceListInput = {
  data: { content: [{ type: 'text' as const, content: { text: 'Trace list message' } }] },
  id: 'trace-list',
  orderId: 1,
  type: 'user-message' as const,
};
/**
 * Exposes this datastore module contract for package-local callers.
 */
export const traceRecordInput = {
  data: { content: [{ type: 'text' as const, content: { text: 'Trace record message' } }] },
  id: 'trace-record',
  orderId: 7,
  type: 'user-message' as const,
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export const openAiCreateInput = {
  data: { apiKey: 'sk-test' },
  name: 'OpenAI',
  provider: 'openai' as const,
};
/**
 * Exposes this datastore module contract for package-local callers.
 */
export const openAiDeleteInput = {
  data: { apiKey: 'sk-delete' },
  name: 'OpenAI',
  provider: 'openai' as const,
};
/**
 * Exposes this datastore module contract for package-local callers.
 */
export const openAiListInput = {
  data: { apiKey: 'sk-list' },
  name: 'OpenAI',
  provider: 'openai' as const,
};
/**
 * Exposes this datastore module contract for package-local callers.
 */
export const ollamaReadInput = {
  data: { baseUrl: 'http://localhost:11434' },
  name: 'Ollama',
  provider: 'ollama' as const,
};
/**
 * Exposes this datastore module contract for package-local callers.
 */
export const openAiUpdateCreateInput = {
  data: { apiKey: 'sk-old' },
  name: 'OpenAI',
  provider: 'openai' as const,
};
/**
 * Exposes this datastore module contract for package-local callers.
 */
export const openAiUpdateInput = {
  data: { apiKey: 'sk-test' },
  name: 'OpenAI',
  provider: 'openai' as const,
};
/**
 * Exposes this datastore module contract for package-local callers.
 */
export const wrongProviderUpdateInput = {
  data: { apiKey: 'sk-wrong-provider' },
  name: 'OpenAI',
  provider: 'openai' as const,
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export const openAiInferenceProfileInput = {
  data: { model: 'gpt-test' },
  kind: 'intelligence' as const,
  name: 'OpenAI GPT',
  provider: 'openai' as const,
};
/**
 * Exposes this datastore module contract for package-local callers.
 */
export const openAiInferenceProfileUpdateInput = {
  data: { model: 'gpt-updated' },
  kind: 'intelligence' as const,
  name: 'OpenAI GPT Updated',
  provider: 'openai' as const,
};

/**
 * Exposes this datastore module contract for package-local callers.
 */
export const claudeCodeInstallCreateInput = {
  data: { executablePath: '/usr/local/bin/claude' },
  frameworkId: 'claude-code' as const,
  name: 'Claude Code',
};
/**
 * Exposes this datastore module contract for package-local callers.
 */
export const claudeCodeInstallDeleteInput = {
  data: { executablePath: '/usr/local/bin/claude' },
  frameworkId: 'claude-code' as const,
  name: 'Claude Code Delete',
};
/**
 * Exposes this datastore module contract for package-local callers.
 */
export const claudeCodeInstallListInput = {
  data: { executablePath: '/usr/local/bin/claude' },
  frameworkId: 'claude-code' as const,
  name: 'Claude Code List',
};
/**
 * Exposes this datastore module contract for package-local callers.
 */
export const claudeCodeInstallUpdateCreateInput = {
  data: { executablePath: '/usr/local/bin/claude' },
  frameworkId: 'claude-code' as const,
  name: 'Claude Code Old',
};
/**
 * Exposes this datastore module contract for package-local callers.
 */
export const claudeCodeInstallUpdateInput = {
  data: { executablePath: '/usr/local/bin/claude-new' },
  frameworkId: 'claude-code' as const,
  name: 'Claude Code New',
};
