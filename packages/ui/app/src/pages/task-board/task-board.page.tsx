import {
  ButtonGroup,
  DataPanelLayout,
  EditableHeading,
  type SelectOption,
  TaskGraph,
  type TaskGraphInput,
  TaskList,
  WorkbenchHeader,
  WorkbenchPageLayout,
} from '@two-pebble/components';
import type {
  AgentRegistryRecord,
  InferenceProfileRecord,
  LoadableRegistry,
  ProtocolTaskRecord,
  TaskDependencyRecord,
  TaskPoolRecord,
  ThirdPartyAgentInstallRecord,
} from '@two-pebble/realtime';
import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { agentRegistryIcon } from '../../shared/agents/agent-registry-icon';
import { TaskBoardSettingsView } from './task-board-settings-view';
import { TaskDetailSidebar } from './task-detail-sidebar';
import { TaskListAccessory } from './task-list-accessory';
import { TaskTemplateEditorSidebar } from './task-template-editor-sidebar';
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
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const selectedTemplate = state.taskTemplates.find((entry) => entry.id === selectedTemplateId) ?? null;

  const graphInput = useMemo<TaskGraphInput>(
    () => buildGraphInput(state.tasks, state.pools, state.dependencies),
    [state.tasks, state.pools, state.dependencies],
  );
  const listTasks = useMemo(() => sortTasksForList(state.tasks), [state.tasks]);
  const delegateOptions = useMemo<SelectOption[]>(
    () => state.agentRegistries.map((registry) => toDelegateOption(registry, state.inferenceProfiles, state.installs)),
    [state.agentRegistries, state.inferenceProfiles, state.installs],
  );

  if (state.boardId.length === 0) {
    return <Navigate replace to="/tasks" />;
  }
  if (state.board === null) {
    return <Navigate replace to="/tasks" />;
  }

  const toggleSelect = (id: string) => {
    setSelectedTemplateId(null);
    state.setSelectedTaskId(state.selectedTaskId === id ? null : id);
  };

  const selectTemplate = (id: string) => {
    state.setSelectedTaskId(null);
    setSelectedTemplateId(selectedTemplateId === id ? null : id);
  };

  const handleDeleteTemplate = (id: string) => {
    if (selectedTemplateId === id) {
      setSelectedTemplateId(null);
    }
    void state.deleteTaskTemplate(id);
  };

  const taskDetailPanel = state.selectedTask ? (
    <TaskDetailSidebar
      task={{
        id: state.selectedTask.id,
        name: state.selectedTask.name,
        status: state.selectedTask.effectiveStatus,
      }}
      ownerAgent={state.selectedOwnerAgent}
      description={state.selectedTask.description}
      descriptionContent={state.selectedTask.descriptionContent}
      taskReferences={state.taskReferences}
      onDescriptionSave={(markdown, content) => void state.saveTaskDescription(markdown, content)}
      onDelegate={(agentRegistryId: string) => void state.delegateSelectedTask(agentRegistryId)}
      onUndelegate={() => void state.undelegateSelectedTask()}
      onOpenAgent={(agentId: string) => state.navigate(`/agents/${agentId}`)}
      onChangeStatus={(status) => {
        if (state.selectedTaskId !== null) {
          void state.setTaskStatusById(state.selectedTaskId, status);
        }
      }}
      delegateAgents={delegateOptions}
      delegateDisabled={state.delegating}
      deliverables={state.selectedTaskDeliverables}
      submissions={state.selectedTaskDeliverableSubmissions}
      onCreateTemplateFromTask={() => {
        if (state.selectedTask === null) {
          return;
        }
        void state.createTaskTemplate({
          name: state.selectedTask.name || 'New template',
          prompt: state.selectedTask.description,
        });
      }}
      onAddDeliverable={() => {
        if (state.selectedTask === null) {
          return;
        }
        void state.createTaskDeliverable({
          taskId: state.selectedTask.id,
          name: 'New deliverable',
          type: 'text',
        });
      }}
    />
  ) : null;

  const templateDetailPanel =
    selectedTemplate !== null ? (
      <TaskTemplateEditorSidebar
        template={selectedTemplate}
        onUpdateTemplate={(input) => void state.updateTaskTemplate(input)}
        onDeleteTemplate={handleDeleteTemplate}
        onCreateDeliverable={(input) => void state.createTaskTemplateDeliverable(input)}
        onUpdateDeliverable={(input) => void state.updateTaskTemplateDeliverable(input)}
        onDeleteDeliverable={(id) => void state.deleteTaskTemplateDeliverable(id)}
      />
    ) : null;

  const drawerOpen = state.selectedTask !== null || selectedTemplate !== null;
  const detailPanel = state.selectedTask !== null ? taskDetailPanel : templateDetailPanel;
  const onCloseDrawer = () => {
    state.setSelectedTaskId(null);
    setSelectedTemplateId(null);
  };

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

  const detailTitle = state.selectedTask
    ? state.selectedTask.name || 'Untitled task'
    : selectedTemplate !== null
      ? selectedTemplate.name || 'Untitled template'
      : undefined;

  return (
    <DataPanelLayout open={drawerOpen} panel={detailPanel} title={detailTitle} closeable onClose={onCloseDrawer}>
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
            renderTaskAccessory={(taskId) => {
              const task = state.tasks.find((entry) => entry.id === taskId);
              if (task === undefined) {
                return null;
              }
              const owner = state.findOwnerAgent(task.ownerId);
              return (
                <TaskListAccessory
                  task={task}
                  ownerName={owner?.name ?? null}
                  delegateOptions={delegateOptions}
                  delegating={state.delegating}
                  trackedPrs={state.trackedPrsForTask(taskId)}
                  onDelegate={(agentRegistryId) => void state.delegateTaskById(taskId, agentRegistryId)}
                  onUndelegate={() => void state.undelegateTaskById(taskId)}
                />
              );
            }}
            onChangeStatus={(taskId, status) => void state.setTaskStatusById(taskId, status)}
          />
        ) : (
          <TaskBoardSettingsView
            pools={state.pools}
            onDeletePool={(poolId: string) => void state.deletePool(poolId)}
            onDeleteBoard={() => void state.deleteBoard()}
            templates={state.taskTemplates}
            onCreateTemplate={(input) => void state.createTaskTemplate(input)}
            onSelectTemplate={selectTemplate}
            selectedTemplateId={selectedTemplateId}
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

function toDelegateOption(
  registry: AgentRegistryRecord,
  profiles: LoadableRegistry<InferenceProfileRecord>,
  installs: LoadableRegistry<ThirdPartyAgentInstallRecord>,
) {
  return {
    icon: agentRegistryIcon(registry, profiles, installs),
    label: registry.name,
    value: registry.id,
  };
}
