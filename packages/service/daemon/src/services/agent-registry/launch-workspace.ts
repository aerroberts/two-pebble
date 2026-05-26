import { generateBranchName } from '@two-pebble/names';
import { createWorktreeForRepository } from '../../utils/worktrees/create-worktree';
import { parseWorkspaceConfig } from './parse-workspace-config';
import type {
  EmitWorktreeInitializedInput,
  LaunchWorkspaceOverride,
  ResolvedLaunchWorkspace,
  ResolveLaunchWorkspaceInput,
} from './types';

export async function resolveLaunchWorkspace(input: ResolveLaunchWorkspaceInput): Promise<ResolvedLaunchWorkspace> {
  if (input.workspaceOverride?.kind === 'inherit') {
    const workspace = await input.datastore.workspaces.read({ id: input.workspaceOverride.workspaceId });
    if (workspace.path.length === 0 && input.registry.kind === 'framework') {
      throw new Error('framework agents cannot inherit workspace kind "none"');
    }
    return { workspace };
  }
  const config = await resolveWorkspaceConfig(input);
  if (config.kind === 'none' && input.registry.kind === 'framework') {
    throw new Error('framework agents cannot launch with workspace kind "none"');
  }
  if (config.kind === 'none') {
    const workspace = await input.datastore.workspaces.create({ path: '', worktreeId: null });
    input.events.emit('workspaceUpdated', workspace);
    return { workspace };
  }
  if (config.kind === 'absolute') {
    const workspace = await input.datastore.workspaces.create({ path: config.path, worktreeId: null });
    input.events.emit('workspaceUpdated', workspace);
    return { workspace };
  }

  const repository = await input.datastore.repositories.read({ id: config.repositoryId });
  const branch = `agent/${generateBranchName()}`;
  const worktree = await createWorktreeForRepository(
    { events: input.events, datastore: input.datastore },
    { branch, repositoryId: repository.id },
  );
  const workspace = await input.datastore.workspaces.create({ path: worktree.path, worktreeId: worktree.id });
  input.events.emit('workspaceUpdated', workspace);
  return { workspace, worktree };
}

async function resolveWorkspaceConfig(input: ResolveLaunchWorkspaceInput) {
  const override = input.workspaceOverride;
  if (override === undefined) {
    return parseWorkspaceConfig({ registry: input.registry });
  }
  if (override.kind === 'absolute' || override.kind === 'none') {
    return override;
  }
  if (override.kind === 'worktree') {
    const repositoryId = await resolveWorktreeRepositoryId(input, override);
    return { kind: 'worktree' as const, repositoryId };
  }
  return parseWorkspaceConfig({ registry: input.registry });
}

async function resolveWorktreeRepositoryId(input: ResolveLaunchWorkspaceInput, override: LaunchWorkspaceOverride) {
  if (override.kind !== 'worktree') {
    throw new Error('Expected worktree workspace override.');
  }
  if (override.repositoryId !== undefined) {
    return override.repositoryId;
  }
  const config = parseWorkspaceConfig({ registry: input.registry });
  if (config.kind === 'worktree') {
    return config.repositoryId;
  }
  if (override.parentWorkspaceId !== undefined) {
    const parentWorkspace = await input.datastore.workspaces.read({ id: override.parentWorkspaceId });
    if (parentWorkspace.worktreeId !== null) {
      const parentWorktree = await input.datastore.worktrees.read({ id: parentWorkspace.worktreeId });
      return parentWorktree.repositoryId;
    }
  }
  throw new Error('worktree workspace override requires a worktree registry or parent worktree workspace');
}

export async function emitWorktreeInitializedTrace(input: EmitWorktreeInitializedInput): Promise<void> {
  const record = await input.datastore.agent.traces.record({
    agentId: input.agentId,
    data: {
      branch: input.worktree.branch,
      path: input.worktree.path,
      repositoryId: input.worktree.repositoryId,
      worktreeId: input.worktree.id,
    },
    id: crypto.randomUUID(),
    orderId: 0,
    type: 'worktree-initialized',
  });
  input.events.emit('agentTraceRecorded', record);
}
