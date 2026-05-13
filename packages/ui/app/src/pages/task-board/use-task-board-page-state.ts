import {
  useAgentRegistries,
  useAgents,
  useTaskBoardContents,
  useTaskBoardMutations,
  useTaskBoards,
  useTaskEvents,
} from '@two-pebble/realtime';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

type TaskBoardView = 'graph' | 'list' | 'settings';
type ActionRunner = () => Promise<void>;
type PoolId = string | null;
type SettableTaskStatus = 'working' | 'waiting' | 'success' | 'failure';

export type { SettableTaskStatus, TaskBoardView };

export function useTaskBoardPageState() {
  const params = useParams();
  const boardId = params.boardId ?? '';
  const navigate = useNavigate();
  const taskBoards = useTaskBoards();
  const contents = useTaskBoardContents({ boardId });
  const mutations = useTaskBoardMutations();
  const agentRegistries = useAgentRegistries();
  const agents = useAgents();
  const board = taskBoards.getItem(boardId)?.value ?? null;
  const [boardNameDraft, setBoardNameDraft] = useState('');
  const [taskNameDraft, setTaskNameDraft] = useState('');
  const [taskDescriptionDraft, setTaskDescriptionDraft] = useState('');
  const [view, setView] = useState<TaskBoardView>('graph');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [delegating, setDelegating] = useState(false);
  const [error, setError] = useState('');

  const selectedTask = useMemo(() => {
    if (selectedTaskId === null) return null;
    return contents.tasks.find((task) => task.id === selectedTaskId) ?? null;
  }, [contents.tasks, selectedTaskId]);

  const taskEventsState = useTaskEvents({ taskId: selectedTask?.id ?? '' });

  useEffect(() => {
    if (board !== null) setBoardNameDraft(board.name);
  }, [board]);

  useEffect(() => {
    if (selectedTask === null) return;
    setTaskNameDraft(selectedTask.name);
    setTaskDescriptionDraft(selectedTask.description);
  }, [selectedTask]);

  const selectedDependencies = useMemo(() => {
    if (selectedTask === null) return [];
    const ids = contents.dependencies.filter((edge) => edge.fromId === selectedTask.id).map((edge) => edge.toId);
    return collectTasksByIds(contents.tasks, ids);
  }, [contents.dependencies, contents.tasks, selectedTask]);

  const selectedDependents = useMemo(() => {
    if (selectedTask === null) return [];
    const ids = contents.dependencies.filter((edge) => edge.toId === selectedTask.id).map((edge) => edge.fromId);
    return collectTasksByIds(contents.tasks, ids);
  }, [contents.dependencies, contents.tasks, selectedTask]);

  const candidateDependencies = useMemo(
    () => collectCandidateDependencies(selectedTask, contents.tasks, selectedDependencies),
    [contents.tasks, selectedDependencies, selectedTask],
  );

  const handle = async (action: ActionRunner) => {
    setError('');
    try {
      await action();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    }
  };

  return {
    agentRegistries: agentRegistries.values(),
    board,
    boardId,
    boardNameDraft,
    candidateDependencies,
    delegating,
    dependencies: contents.dependencies,
    error,
    navigate,
    pools: contents.pools,
    selectedDependencies,
    selectedDependents,
    selectedTask,
    selectedTaskId,
    setBoardNameDraft,
    setSelectedTaskId,
    setTaskDescriptionDraft,
    setTaskNameDraft,
    setView,
    taskDescriptionDraft,
    taskEvents: taskEventsState.events,
    taskNameDraft,
    tasks: contents.tasks,
    view,
    saveBoardName: () =>
      handle(async () => {
        const trimmed = boardNameDraft.trim();
        if (board === null) return;
        if (trimmed.length === 0 || trimmed === board.name) return;
        await mutations.updateBoard({ id: board.id, name: trimmed });
      }),
    saveTaskName: () =>
      handle(async () => {
        if (selectedTask === null) return;
        const trimmed = taskNameDraft.trim();
        if (trimmed.length === 0 || trimmed === selectedTask.name) return;
        await mutations.renameTask({ id: selectedTask.id, name: trimmed });
      }),
    saveTaskDescription: () =>
      handle(async () => {
        if (selectedTask === null) return;
        if (taskDescriptionDraft === selectedTask.description) return;
        await mutations.updateTaskDescription({ id: selectedTask.id, description: taskDescriptionDraft });
      }),
    setSelectedTaskStatus: (status: SettableTaskStatus) =>
      handle(async () => {
        if (selectedTask === null) return;
        await mutations.setTaskStatus({ id: selectedTask.id, status, reason: `manual: set to ${status}` });
      }),
    addSelectedTaskDependency: (toId: string) =>
      handle(async () => {
        if (selectedTask === null) return;
        await mutations.createDependency({ boardId, fromId: selectedTask.id, toId });
      }),
    delegateSelectedTask: (agentRegistryId: string) =>
      handle(async () => {
        if (selectedTask === null) return;
        setDelegating(true);
        try {
          await mutations.delegateTask({ taskId: selectedTask.id, agentRegistryId });
        } finally {
          setDelegating(false);
        }
      }),
    undelegateSelectedTask: () =>
      handle(async () => {
        if (selectedTask === null) return;
        await mutations.undelegateTask({ taskId: selectedTask.id });
      }),
    selectedOwnerAgent: collectOwnerAgent(selectedTask, agents.values()),
    renameTaskFromList: (id: string, name: string) =>
      handle(async () => {
        const trimmed = name.trim();
        const target = contents.tasks.find((task) => task.id === id);
        if (target !== undefined && trimmed === target.name) return;
        await mutations.renameTask({ id, name: trimmed });
      }),
    createTaskAfter: async (input: { poolId: PoolId; name?: string }) => {
      try {
        const result = await mutations.createTask({
          boardId,
          poolId: input.poolId,
          name: input.name ?? '',
          dependsOn: [],
        });
        return result.id;
      } catch (failure) {
        setError(failure instanceof Error ? failure.message : String(failure));
        return undefined;
      }
    },
    deleteTaskFromList: (id: string) =>
      handle(async () => {
        await mutations.deleteTask({ id });
      }),
    deletePool: (poolId: string) =>
      handle(async () => {
        await mutations.deletePool({ id: poolId });
      }),
    deleteBoard: () =>
      handle(async () => {
        if (board === null) return;
        await mutations.deleteBoard({ id: board.id });
        navigate('/tasks');
      }),
  };
}

interface AgentLike {
  id: string;
  name: string;
}

function collectOwnerAgent<T extends { ownerId: string | null }>(
  selectedTask: T | null,
  agents: AgentLike[],
): AgentLike | null {
  if (selectedTask === null || selectedTask.ownerId === null) return null;
  return agents.find((entry) => entry.id === selectedTask.ownerId) ?? null;
}

function collectCandidateDependencies<T extends { id: string; name: string; poolId: PoolId; effectiveStatus: string }>(
  selectedTask: T | null,
  allTasks: T[],
  existingDeps: T[],
): T[] {
  if (selectedTask === null) return [];
  const excluded = new Set<string>([selectedTask.id, ...existingDeps.map((entry) => entry.id)]);
  return allTasks.filter((task) => task.poolId === selectedTask.poolId && !excluded.has(task.id));
}

function collectTasksByIds<T extends { id: string }>(tasks: T[], ids: string[]): T[] {
  const lookup = new Map<string, T>();
  for (const task of tasks) lookup.set(task.id, task);
  const result: T[] = [];
  for (const id of ids) {
    const task = lookup.get(id);
    if (task) result.push(task);
  }
  return result;
}
