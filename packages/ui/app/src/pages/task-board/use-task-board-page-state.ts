import {
  type ProtocolTaskRecord,
  useAgentRegistries,
  useAgents,
  useBoardTaskTemplates,
  useInferenceProfiles,
  useRealtimeDatastore,
  useTaskBoardContents,
  useTaskBoardMutations,
  useTaskBoards,
  useTaskDeliverableSubmissions,
  useTaskDeliverables,
  useTaskEvents,
  useTaskTemplateMutations,
  useThirdPartyAgentInstalls,
} from '@two-pebble/realtime';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

type TaskBoardView = 'graph' | 'list' | 'settings';
type ActionRunner = () => Promise<void>;
type PoolId = string | null;
type SettableTaskStatus = 'working' | 'waiting' | 'success' | 'failure';
type CreateTaskAfterInput = { poolId: PoolId; name?: string; templateId?: string | null };
type SelectedTaskRecord = ProtocolTaskRecord | null;
type OwnerAgentResult = AgentLike | null;

interface AgentLike {
  id: string;
  name: string;
}

export type DispatchScopeKind = 'board' | 'pool';
export type DispatchMode = 'manual' | 'automatic';

export interface DispatchSettingsValue {
  concurrency: number;
  dispatchMode: DispatchMode;
  autoAgentRegistryId: string | null;
}

export interface DispatchSettingsUpdateInput extends DispatchSettingsValue {
  scopeKind: DispatchScopeKind;
  scopeId: string;
}

export const DEFAULT_DISPATCH_SETTINGS: DispatchSettingsValue = {
  concurrency: 0,
  dispatchMode: 'manual',
  autoAgentRegistryId: null,
};

export type { SettableTaskStatus, TaskBoardView };

export function useTaskBoardPageState() {
  const params = useParams();
  const boardId = params.boardId ?? '';
  const navigate = useNavigate();
  const taskBoards = useTaskBoards();
  const contents = useTaskBoardContents({ boardId });
  const taskTemplates = useBoardTaskTemplates({ boardId });
  const mutations = useTaskBoardMutations();
  const templateMutations = useTaskTemplateMutations();
  const agentRegistries = useAgentRegistries();
  const inferenceProfiles = useInferenceProfiles();
  const installs = useThirdPartyAgentInstalls();
  const agents = useAgents();
  const datastore = useRealtimeDatastore();
  const board = taskBoards.getItem(boardId)?.value ?? null;
  const [boardDispatchSettings, setBoardDispatchSettings] = useState<DispatchSettingsValue>(DEFAULT_DISPATCH_SETTINGS);
  const [poolDispatchSettings, setPoolDispatchSettings] = useState<Record<string, DispatchSettingsValue>>({});
  const [boardNameDraft, setBoardNameDraft] = useState('');
  const [taskNameDraft, setTaskNameDraft] = useState('');
  const [taskDescriptionDraft, setTaskDescriptionDraft] = useState('');
  const [view, setView] = useState<TaskBoardView>('graph');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [delegating, setDelegating] = useState(false);
  const [error, setError] = useState('');
  const selectedTask = useMemo(() => {
    if (selectedTaskId === null) {
      return null;
    }
    return contents.tasks.find((task) => task.id === selectedTaskId) ?? null;
  }, [contents.tasks, selectedTaskId]);
  const taskEventsState = useTaskEvents({ taskId: selectedTask?.id ?? '' });
  const selectedTaskDeliverablesState = useTaskDeliverables({ taskId: selectedTask?.id ?? '' });
  const selectedTaskDeliverableSubmissionsState = useTaskDeliverableSubmissions({ taskId: selectedTask?.id ?? '' });
  useEffect(() => {
    if (board !== null) {
      setBoardNameDraft(board.name);
    }
  }, [board]);

  useEffect(() => {
    if (boardId.length === 0) {
      return;
    }
    let cancelled = false;
    void datastore.taskDispatchSettings
      .read({ scopeKind: 'board', scopeId: boardId })
      .then((result) => {
        if (cancelled || result.settings === null) {
          return;
        }
        setBoardDispatchSettings({
          concurrency: result.settings.concurrency,
          dispatchMode: result.settings.dispatchMode,
          autoAgentRegistryId: result.settings.autoAgentRegistryId,
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [boardId, datastore]);

  useEffect(() => {
    let cancelled = false;
    void datastore.taskDispatchSettings
      .list()
      .then((result) => {
        if (cancelled) {
          return;
        }
        const next: Record<string, DispatchSettingsValue> = {};
        for (const item of result.items) {
          if (item.scopeKind === 'pool') {
            next[item.scopeId] = {
              concurrency: item.concurrency,
              dispatchMode: item.dispatchMode,
              autoAgentRegistryId: item.autoAgentRegistryId,
            };
          }
        }
        setPoolDispatchSettings(next);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [datastore]);

  useEffect(() => {
    if (selectedTask === null) {
      return;
    }
    setTaskNameDraft(selectedTask.name);
    setTaskDescriptionDraft(selectedTask.description);
  }, [selectedTask]);
  const selectedDependencies = useMemo(() => {
    if (selectedTask === null) {
      return [];
    }
    const ids = contents.dependencies.filter((edge) => edge.fromId === selectedTask.id).map((edge) => edge.toId);
    return collectTasksByIds(contents.tasks, ids);
  }, [contents.dependencies, contents.tasks, selectedTask]);
  const selectedDependents = useMemo(() => {
    if (selectedTask === null) {
      return [];
    }
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

  const saveDispatchSettings = useCallback(
    async (input: DispatchSettingsUpdateInput) => {
      const result = await datastore.taskDispatchSettings.update({
        scopeKind: input.scopeKind,
        scopeId: input.scopeId,
        concurrency: input.concurrency,
        dispatchMode: input.dispatchMode,
        autoAgentRegistryId: input.autoAgentRegistryId,
      });
      const next: DispatchSettingsValue = {
        concurrency: result.settings.concurrency,
        dispatchMode: result.settings.dispatchMode,
        autoAgentRegistryId: result.settings.autoAgentRegistryId,
      };
      if (input.scopeKind === 'board') {
        setBoardDispatchSettings(next);
      } else {
        setPoolDispatchSettings((current) => ({ ...current, [input.scopeId]: next }));
      }
    },
    [datastore],
  );
  return {
    agentRegistries: agentRegistries.values(),
    inferenceProfiles,
    installs,
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
    taskTemplates: taskTemplates.templates,
    selectedTaskDeliverables: selectedTaskDeliverablesState.deliverables,
    selectedTaskDeliverableSubmissions: selectedTaskDeliverableSubmissionsState.submissions,
    taskNameDraft,
    tasks: contents.tasks,
    view,
    saveBoardName: () =>
      handle(async () => {
        const trimmed = boardNameDraft.trim();
        if (board === null) {
          return;
        }
        if (trimmed.length === 0 || trimmed === board.name) {
          return;
        }
        await mutations.updateBoard({ id: board.id, name: trimmed });
      }),
    saveTaskName: () =>
      handle(async () => {
        if (selectedTask === null) {
          return;
        }
        const trimmed = taskNameDraft.trim();
        if (trimmed.length === 0 || trimmed === selectedTask.name) {
          return;
        }
        await mutations.renameTask({ id: selectedTask.id, name: trimmed });
      }),
    saveTaskDescription: () =>
      handle(async () => {
        if (selectedTask === null) {
          return;
        }
        if (taskDescriptionDraft === selectedTask.description) {
          return;
        }
        await mutations.updateTaskDescription({ id: selectedTask.id, description: taskDescriptionDraft });
      }),
    setSelectedTaskStatus: (status: SettableTaskStatus) =>
      handle(async () => {
        if (selectedTask === null) {
          return;
        }
        await mutations.setTaskStatus({ id: selectedTask.id, status, reason: `manual: set to ${status}` });
      }),
    addSelectedTaskDependency: (toId: string) =>
      handle(async () => {
        if (selectedTask === null) {
          return;
        }
        await mutations.createDependency({ boardId, fromId: selectedTask.id, toId });
      }),
    delegateSelectedTask: (agentRegistryId: string) =>
      handle(async () => {
        if (selectedTask === null) {
          return;
        }
        setDelegating(true);
        try {
          await mutations.delegateTask({ taskId: selectedTask.id, agentRegistryId });
        } finally {
          setDelegating(false);
        }
      }),
    undelegateSelectedTask: () =>
      handle(async () => {
        if (selectedTask === null) {
          return;
        }
        await mutations.undelegateTask({ taskId: selectedTask.id });
      }),
    selectedOwnerAgent: collectOwnerAgent(selectedTask, agents.values()),
    renameTaskFromList: (id: string, name: string) =>
      handle(async () => {
        const trimmed = name.trim();
        const target = contents.tasks.find((task) => task.id === id);
        if (target !== undefined && trimmed === target.name) {
          return;
        }
        await mutations.renameTask({ id, name: trimmed });
      }),
    createTaskAfter: async (input: CreateTaskAfterInput) => {
      try {
        const result = await mutations.createTask({
          boardId,
          poolId: input.poolId,
          name: input.name ?? '',
          dependsOn: [],
          templateId: input.templateId ?? null,
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
        if (board === null) {
          return;
        }
        await mutations.deleteBoard({ id: board.id });
        navigate('/tasks');
      }),
    boardDispatchSettings,
    poolDispatchSettings,
    saveDispatchSettings: (input: DispatchSettingsUpdateInput) =>
      handle(async () => {
        await saveDispatchSettings(input);
      }),
    createTaskTemplate: (input: { name: string; prompt?: string }) =>
      handle(async () => {
        await templateMutations.createTemplate({ boardId, name: input.name, prompt: input.prompt ?? '' });
      }),
    updateTaskTemplate: (input: { id: string; name?: string; prompt?: string }) =>
      handle(async () => {
        await templateMutations.updateTemplate(input);
      }),
    deleteTaskTemplate: (id: string) =>
      handle(async () => {
        await templateMutations.deleteTemplate({ id });
      }),
    createTaskTemplateDeliverable: (input: {
      templateId: string;
      name: string;
      description?: string;
      type: 'text' | 'pr_url';
      orderIndex?: number;
    }) =>
      handle(async () => {
        await templateMutations.createDeliverable(input);
      }),
    updateTaskTemplateDeliverable: (input: {
      id: string;
      name?: string;
      description?: string;
      type?: 'text' | 'pr_url';
      orderIndex?: number;
    }) =>
      handle(async () => {
        await templateMutations.updateDeliverable(input);
      }),
    deleteTaskTemplateDeliverable: (id: string) =>
      handle(async () => {
        await templateMutations.deleteDeliverable({ id });
      }),
  };
}

function collectOwnerAgent(selectedTask: SelectedTaskRecord, agents: AgentLike[]): OwnerAgentResult {
  if (selectedTask === null || selectedTask.ownerId === null) {
    return null;
  }
  return agents.find((entry) => entry.id === selectedTask.ownerId) ?? null;
}

function collectCandidateDependencies(
  selectedTask: SelectedTaskRecord,
  allTasks: ProtocolTaskRecord[],
  existingDeps: ProtocolTaskRecord[],
): ProtocolTaskRecord[] {
  if (selectedTask === null) {
    return [];
  }
  const excluded = new Set<string>([selectedTask.id, ...existingDeps.map((entry) => entry.id)]);
  return allTasks.filter((task) => task.poolId === selectedTask.poolId && !excluded.has(task.id));
}

function collectTasksByIds(tasks: ProtocolTaskRecord[], ids: string[]): ProtocolTaskRecord[] {
  const lookup = new Map<string, ProtocolTaskRecord>();
  for (const task of tasks) {
    lookup.set(task.id, task);
  }
  const result: ProtocolTaskRecord[] = [];
  for (const id of ids) {
    const task = lookup.get(id);
    if (task) {
      result.push(task);
    }
  }
  return result;
}
