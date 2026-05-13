import { useTaskBoardMutations, useTaskBoards } from '@two-pebble/realtime';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PLACEHOLDER_BOARD_NAME = 'Untitled board';

export function useTasksPageState() {
  const taskBoards = useTaskBoards();
  const mutations = useTaskBoardMutations();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const createBoard = async () => {
    setCreating(true);
    setError('');
    try {
      const created = await mutations.createBoard({ name: PLACEHOLDER_BOARD_NAME });
      navigate(`/tasks/${created.id}`);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setCreating(false);
    }
  };

  const deleteBoard = async (id: string) => {
    try {
      await mutations.deleteBoard({ id });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    }
  };

  return {
    creating,
    deleteBoard,
    error,
    navigate,
    onCreateBoard: () => void createBoard(),
    taskBoards,
  };
}
