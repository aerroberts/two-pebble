import { generateBranchName } from '@two-pebble/names';
import { createWorktreeForRepository } from '../../utils/worktrees/create-worktree';
import { parseWorkspaceConfig } from './parse-workspace-config';
import type { EmitWorktreeInitializedInput, ResolvedLaunchWorkspace, ResolveLaunchWorkspaceInput } from './types';

export async function resolveLaunchWorkspace(input: ResolveLaunchWorkspaceInput): Promise<ResolvedLaunchWorkspace> {
  const config = parseWorkspaceConfig({ logger: input.logger, registry: input.registry });
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
