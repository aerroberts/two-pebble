import {
  ButtonGroup,
  DataPanelLayout,
  EditableHeading,
  TaskGraph,
  type TaskGraphInput,
  TaskList,
  WorkbenchHeader,
  WorkbenchPageLayout,
} from '@two-pebble/components';
import type {
  AgentRegistryRecord,
  ProtocolTaskRecord,
  TaskDependencyRecord,
  TaskPoolRecord,
} from '@two-pebble/realtime';
import { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { TaskBoardSettingsView } from './task-board-settings-view';
import { TaskDetailSidebar } from './task-detail-sidebar';
import { type TaskBoardView, useTaskBoardPageState } from './use-task-board-page-state';

const VIEW_OPTIONS = [
  { value: 'graph', label: 'Graph' },
  { value: 'list', label: 'List' },
  { value: 'settings', label: 'Settings' },
];

const STATUS_SORT_ORDER: Record<string, number> = {
  open: 0,
  blocked: 1,
  working: 2,
  waiting: 3,
  pending: 4,
  success: 10,
  failure: 11,
  closed: 12,
};

export function TaskBoardPage() {
  const state = useTaskBoardPageState();

  const graphInput = useMemo<TaskGraphInput>(
    () => buildGraphInput(state.tasks, state.pools, state.dependencies),
    [state.tasks, state.pools, state.dependencies],
  );
  const listTasks = useMemo(() => sortTasksForList(state.tasks), [state.tasks]);

  if (state.boardId.length === 0) return <Navigate replace to="/tasks" />;
  if (state.board === null) return <Navigate replace to="/tasks" />;

  const toggleSelect = (id: string) => {
    state.setSelectedTaskId(state.selectedTaskId === id ? null : id);
  };

  const detailPanel = state.selectedTask ? (
    <TaskDetailSidebar
      task={{ id: state.selectedTask.id, name: state.selectedTask.name }}
      ownerAgent={state.selectedOwnerAgent}
      descriptionDraft={state.taskDescriptionDraft}
      onDescriptionChange={(value: string) => state.setTaskDescriptionDraft(value)}
      onDescriptionSave={() => void state.saveTaskDescription()}
      onDelegate={(agentRegistryId: string) => void state.delegateSelectedTask(agentRegistryId)}
      onUndelegate={() => void state.undelegateSelectedTask()}
      onOpenAgent={(agentId: string) => state.navigate(`/agents/${agentId}`)}
      delegateAgents={state.agentRegistries.map(toDelegateOption)}
      delegateDisabled={state.delegating}
    />
  ) : null;

  const header = (
    <WorkbenchHeader
      title={
        <EditableHeading
          ariaLabel="Board name"
          onBlur={() => void state.saveBoardName()}
          onChange={(value: string) => state.setBoardNameDraft(value)}
          placeholder="Untitled board"
          size="sm"
          value={state.boardNameDraft}
        />
      }
      rightAccessory={
        <ButtonGroup
          options={VIEW_OPTIONS}
          value={state.view}
          onChange={(value: string) => state.setView(value as TaskBoardView)}
        />
      }
    />
  );

  return (
    <DataPanelLayout
      open={state.selectedTask !== null}
      panel={detailPanel}
      closeable
      onClose={() => state.setSelectedTaskId(null)}
    >
      <WorkbenchPageLayout body={state.view === 'graph' ? 'fill' : 'padded-scroll'} header={header}>
        {state.view === 'graph' ? (
          <TaskGraph
            graph={graphInput}
            selectedTaskId={state.selectedTaskId ?? undefined}
            onSelectTask={toggleSelect}
          />
        ) : state.view === 'list' ? (
          <TaskList
            tasks={listTasks.map(toListTask)}
            pools={state.pools.map(toListPool)}
            selectedTaskId={state.selectedTaskId ?? undefined}
            onSelectTask={toggleSelect}
            onRenameTask={(id: string, name: string) => void state.renameTaskFromList(id, name)}
            onCreateTaskAfter={(input) => state.createTaskAfter({ poolId: input.poolId, name: input.name })}
            onDeleteTask={(id: string) => void state.deleteTaskFromList(id)}
            emptyState="No tasks yet."
          />
        ) : (
          <TaskBoardSettingsView
            boardNameDraft={state.boardNameDraft}
            onBoardNameChange={(value: string) => state.setBoardNameDraft(value)}
            onBoardNameSave={() => void state.saveBoardName()}
            pools={state.pools}
            onDeletePool={(poolId: string) => void state.deletePool(poolId)}
            onDeleteBoard={() => void state.deleteBoard()}
          />
        )}
      </WorkbenchPageLayout>
    </DataPanelLayout>
  );
}

function buildGraphInput(
  tasks: ProtocolTaskRecord[],
  pools: TaskPoolRecord[],
  dependencies: TaskDependencyRecord[],
): TaskGraphInput {
  return {
    tasks: tasks.map((task) => ({
      id: task.id,
      name: task.name,
      poolId: task.poolId,
      status: task.effectiveStatus,
    })),
    pools: pools.map((pool) => ({
      id: pool.id,
      name: pool.name,
      parentPoolId: pool.parentPoolId,
    })),
    dependencies: dependencies.map((edge) => ({ fromId: edge.fromId, toId: edge.toId })),
  };
}

function sortTasksForList(tasks: ProtocolTaskRecord[]): ProtocolTaskRecord[] {
  return [...tasks].sort((left, right) => {
    const leftWeight = STATUS_SORT_ORDER[left.effectiveStatus] ?? 5;
    const rightWeight = STATUS_SORT_ORDER[right.effectiveStatus] ?? 5;
    return leftWeight - rightWeight;
  });
}

function toListTask(task: ProtocolTaskRecord) {
  return { id: task.id, name: task.name, poolId: task.poolId, status: task.effectiveStatus };
}

function toListPool(pool: TaskPoolRecord) {
  return { id: pool.id, name: pool.name, parentPoolId: pool.parentPoolId };
}

function toDelegateOption(registry: AgentRegistryRecord) {
  return { value: registry.id, label: registry.name };
}
