import { useCreateRepository, useRepositories } from '@two-pebble/realtime';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useRepositoriesPageState() {
  const createRepository = useCreateRepository();
  const repositories = useRepositories();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const createNewRepository = async () => {
    setCreateError('');
    setCreating(true);
    try {
      const created = await createRepository({ baseBranch: 'main', name: '', path: '' });
      navigate(`/configuration/repositories/${created.id}`);
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'Could not create repository.');
    } finally {
      setCreating(false);
    }
  };

  return {
    createError,
    createNewRepository,
    creating,
    navigate,
    repositories,
  };
}
