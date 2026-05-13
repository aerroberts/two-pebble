import { generateBranchName } from '@two-pebble/names';
import {
  useCreateWorktree,
  useDeleteRepository,
  useDeleteWorktree,
  useRepositories,
  useUpdateRepository,
  useWorktrees,
} from '@two-pebble/realtime';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export function useRepositorySettingsPageState() {
  const repositories = useRepositories();
  const worktrees = useWorktrees();
  const params = useParams();
  const navigate = useNavigate();
  const repositoryId = params.repositoryId ?? '';
  const repository = repositories.getItem(repositoryId);

  const updateRepository = useUpdateRepository();
  const deleteRepository = useDeleteRepository();
  const createWorktree = useCreateWorktree();
  const deleteWorktree = useDeleteWorktree();

  const [name, setName] = useState('');
  const [path, setPath] = useState('');
  const [baseBranch, setBaseBranch] = useState('');
  const [creatingWorktree, setCreatingWorktree] = useState(false);
  const [worktreeError, setWorktreeError] = useState('');

  useEffect(() => {
    if (repository?.value !== null && repository?.value !== undefined) {
      setName(repository.value.name);
      setPath(repository.value.path);
      setBaseBranch(repository.value.baseBranch);
    }
  }, [repository?.value]);

  const repositoryWorktrees = useMemo(
    () => worktrees.entries().filter((entry) => entry.value.repositoryId === repositoryId),
    [worktrees, repositoryId],
  );

  const updateName = () => {
    if (repository?.value === null || repository?.value === undefined || name === repository.value.name) {
      return;
    }
    void updateRepository({ id: repositoryId, name });
  };

  const updatePath = () => {
    if (repository?.value === null || repository?.value === undefined || path === repository.value.path) {
      return;
    }
    void updateRepository({ id: repositoryId, path });
  };

  const updateBaseBranch = () => {
    if (repository?.value === null || repository?.value === undefined || baseBranch === repository.value.baseBranch) {
      return;
    }
    void updateRepository({ baseBranch, id: repositoryId });
  };

  const deleteSelectedRepository = () => {
    void deleteRepository({ id: repositoryId });
    navigate('/configuration/repositories');
  };

  const createNewWorktree = async () => {
    setWorktreeError('');
    setCreatingWorktree(true);
    try {
      await createWorktree({ branch: generateBranchName(), repositoryId });
    } catch (error) {
      setWorktreeError(error instanceof Error ? error.message : 'Could not create worktree.');
    } finally {
      setCreatingWorktree(false);
    }
  };

  const deleteSelectedWorktree = (worktreeId: string) => {
    void deleteWorktree({ id: worktreeId });
  };

  return {
    baseBranch,
    createNewWorktree,
    creatingWorktree,
    deleteSelectedRepository,
    deleteSelectedWorktree,
    name,
    path,
    redirectToRepositories: repositoryId.length === 0,
    repository,
    repositoryId,
    repositoryWorktrees,
    setBaseBranch,
    setName,
    setPath,
    updateBaseBranch,
    updateName,
    updatePath,
    worktreeError,
  };
}
