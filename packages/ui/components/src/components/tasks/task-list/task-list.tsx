import { type ReactNode, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '../../content/icon/icon';
import { Select, type SelectOption } from '../../input/select/select';
import { TaskStatusIcon } from '../task-status-icon/task-status-icon';
import type { TaskStatusIconStatus } from '../task-status-icon/types';
import { collectFlatTaskOrder } from './flat-order';
import { buildTaskListTree, type TaskListNode } from './tree';

export interface TaskListTask {
  id: string;
  name: string;
  poolId: string | null;
  status: TaskStatusIconStatus;
}

export interface TaskListPool {
  id: string;
  name: string;
  parentPoolId: string | null;
}

export interface TaskListCreateAfterInput {
  poolId: string | null;
  afterTaskId: string | null;
  name?: string;
  templateId?: string | null;
}

export interface TaskListProps {
  tasks: TaskListTask[];
  pools: TaskListPool[];
  selectedTaskId?: string;
  emptyState?: string;
  onSelectTask?: (taskId: string) => void;
  onRenameTask?: (taskId: string, name: string) => void;
  onCreateTaskAfter?: (input: TaskListCreateAfterInput) => Promise<string | undefined>;
  onDeleteTask?: (taskId: string) => void;
  templateOptions?: SelectOption[];
  /**
   * Optional trailing accessory rendered to the right of each task row.
   * Used by the task board page to embed delegation + status controls
   * inline so users can drive task state without opening the detail
   * sidebar. The accessory only renders when this prop is provided —
   * usages without controls (e.g. read-only embeds) stay unchanged.
   */
  renderTaskAccessory?: (taskId: string) => ReactNode;
}

export function TaskList(props: TaskListProps) {
  const tree = useMemo(() => buildTaskListTree(props.tasks, props.pools), [props.tasks, props.pools]);
  const flatOrder = useMemo(() => collectFlatTaskOrder(tree), [tree]);
  const cellRefs = useRef(new Map<string, HTMLInputElement>());
  const [pendingFocusId, setPendingFocusId] = useState<string | null>(null);
  useFocusPending(pendingFocusId, cellRefs.current, () => setPendingFocusId(null));

  const createFromGhost = async (name: string, templateId: string | null) => {
    if (props.onCreateTaskAfter === undefined) {
      return;
    }
    const trimmed = name.trim();
    const newTaskId = await props.onCreateTaskAfter({
      poolId: null,
      afterTaskId: null,
      name: trimmed.length > 0 ? trimmed : undefined,
      templateId,
    });
    if (newTaskId === undefined) {
      return;
    }
    setPendingFocusId(newTaskId);
  };

  const canCreate = props.onCreateTaskAfter !== undefined;

  if (tree.length === 0 && !canCreate) {
    return <div className="px-3 py-4 text-[12px] text-content-muted">{props.emptyState ?? 'Nothing to show.'}</div>;
  }

  const focusLastCell = () => {
    for (let index = flatOrder.length - 1; index >= 0; index -= 1) {
      const taskId = flatOrder[index];
      if (taskId === undefined) {
        continue;
      }
      const element = cellRefs.current.get(taskId);
      if (element !== undefined) {
        element.focus();
        return;
      }
    }
  };

  const moveFocus = (currentTaskId: string, offset: number) => {
    const index = flatOrder.indexOf(currentTaskId);
    if (index < 0) {
      return;
    }
    const targetId = flatOrder[index + offset];
    if (!targetId) {
      return;
    }
    cellRefs.current.get(targetId)?.focus();
  };

  const handleEnter = async (currentTaskId: string) => {
    const task = props.tasks.find((entry) => entry.id === currentTaskId);
    if (task === undefined || props.onCreateTaskAfter === undefined) {
      return;
    }
    const newTaskId = await props.onCreateTaskAfter({ poolId: task.poolId, afterTaskId: currentTaskId });
    if (newTaskId !== undefined) {
      setPendingFocusId(newTaskId);
    }
  };

  const handleDeleteEmpty = (currentTaskId: string) => {
    const index = flatOrder.indexOf(currentTaskId);
    if (index <= 0) {
      return;
    }
    const previousId = flatOrder[index - 1];
    props.onDeleteTask?.(currentTaskId);
    if (previousId !== undefined) {
      setPendingFocusId(previousId);
    }
  };

  return (
    <ul className="flex flex-col gap-0.5">
      {tree.map((node) => (
        <TaskListNodeRow
          key={node.id}
          node={node}
          depth={0}
          selectedTaskId={props.selectedTaskId}
          cellRefs={cellRefs.current}
          onSelectTask={props.onSelectTask}
          onRenameTask={props.onRenameTask}
          onDeleteEmpty={handleDeleteEmpty}
          onEnter={handleEnter}
          onMoveFocus={moveFocus}
          renderTaskAccessory={props.renderTaskAccessory}
        />
      ))}
      {canCreate ? (
        <TaskListGhostRow
          depth={0}
          onCreateTask={createFromGhost}
          onArrowUp={focusLastCell}
          templateOptions={props.templateOptions ?? []}
        />
      ) : null}
    </ul>
  );
}

function useFocusPending(pendingId: string | null, cellRefs: Map<string, HTMLInputElement>, onConsumed: () => void) {
  useLayoutEffect(() => {
    if (pendingId === null) {
      return;
    }
    const element = cellRefs.get(pendingId);
    if (element === undefined) {
      return;
    }
    element.focus();
    element.setSelectionRange(element.value.length, element.value.length);
    onConsumed();
  }, [pendingId, cellRefs, onConsumed]);
}

interface TaskListNodeRowProps {
  node: TaskListNode;
  depth: number;
  selectedTaskId: string | undefined;
  cellRefs: Map<string, HTMLInputElement>;
  onSelectTask: ((taskId: string) => void) | undefined;
  onRenameTask: ((taskId: string, name: string) => void) | undefined;
  onDeleteEmpty: (taskId: string) => void;
  onEnter: (taskId: string) => void;
  onMoveFocus: (taskId: string, offset: number) => void;
  renderTaskAccessory: ((taskId: string) => ReactNode) | undefined;
}

function TaskListNodeRow(props: TaskListNodeRowProps) {
  const [open, setOpen] = useState(true);
  const { node } = props;

  if (node.kind === 'task') {
    return (
      <TaskListCellRow
        cellRefs={props.cellRefs}
        depth={props.depth}
        node={node}
        selectedTaskId={props.selectedTaskId}
        onDeleteEmpty={props.onDeleteEmpty}
        onEnter={props.onEnter}
        onMoveFocus={props.onMoveFocus}
        onRenameTask={props.onRenameTask}
        onSelectTask={props.onSelectTask}
        renderTaskAccessory={props.renderTaskAccessory}
      />
    );
  }

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-2 rounded-lg py-1.5 text-left text-[12px] leading-4 text-content-muted transition-colors hover:text-content"
        style={{ paddingLeft: indentPaddingPx(props.depth), paddingRight: 12 }}
      >
        <Icon name={open ? 'chevron-down' : 'chevron-right'} color="text-current" className="size-3.5" />
        <Icon name="blocks" color="text-current" className="size-3.5" />
        <span className="truncate font-heading font-normal uppercase tracking-[0.08em]">{node.name}</span>
      </button>
      {open ? (
        <ul className="flex flex-col gap-0.5">
          {node.children.map((child) => (
            <TaskListNodeRow
              key={child.id}
              node={child}
              depth={props.depth + 1}
              selectedTaskId={props.selectedTaskId}
              cellRefs={props.cellRefs}
              onSelectTask={props.onSelectTask}
              onRenameTask={props.onRenameTask}
              onDeleteEmpty={props.onDeleteEmpty}
              onEnter={props.onEnter}
              onMoveFocus={props.onMoveFocus}
              renderTaskAccessory={props.renderTaskAccessory}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

interface TaskListCellRowProps {
  node: TaskListNode & { kind: 'task' };
  depth: number;
  selectedTaskId: string | undefined;
  cellRefs: Map<string, HTMLInputElement>;
  onSelectTask: ((taskId: string) => void) | undefined;
  onRenameTask: ((taskId: string, name: string) => void) | undefined;
  onDeleteEmpty: (taskId: string) => void;
  onEnter: (taskId: string) => void;
  onMoveFocus: (taskId: string, offset: number) => void;
  renderTaskAccessory: ((taskId: string) => ReactNode) | undefined;
}

function TaskListCellRow(props: TaskListCellRowProps) {
  const { node } = props;
  const [draft, setDraft] = useState(node.name);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isSelected = props.selectedTaskId === node.id;
  const textClass = isSelected ? 'text-accent' : 'text-content-muted focus-within:text-content hover:text-content';

  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setDraft(node.name);
    }
  }, [node.name]);

  const setRef = (element: HTMLInputElement | null) => {
    inputRef.current = element;
    if (element === null) {
      props.cellRefs.delete(node.id);
    } else {
      props.cellRefs.set(node.id, element);
    }
  };

  const commitRename = () => {
    if (draft === node.name) {
      return;
    }
    props.onRenameTask?.(node.id, draft);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commitRename();
      props.onEnter(node.id);
      return;
    }
    if (event.key === 'Backspace' && draft.length === 0) {
      event.preventDefault();
      props.onDeleteEmpty(node.id);
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      props.onMoveFocus(node.id, 1);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      props.onMoveFocus(node.id, -1);
    }
  };

  const accessory = props.renderTaskAccessory?.(node.id);
  return (
    <li>
      <div
        className={`flex w-full items-center gap-2 rounded-lg py-1.5 text-[12px] leading-4 transition-colors ${textClass}`}
        style={{ paddingLeft: indentPaddingPx(props.depth), paddingRight: 12 }}
      >
        <span className="inline-block w-3.5 shrink-0" />
        <TaskStatusIcon status={node.status} size="sm" />
        <input
          ref={setRef}
          aria-label="Task name"
          className="min-w-0 flex-1 truncate bg-transparent font-heading font-normal tracking-[0.08em] text-current outline-none"
          onBlur={commitRename}
          onChange={(event) => setDraft(event.target.value)}
          onFocus={() => props.onSelectTask?.(node.id)}
          onKeyDown={handleKeyDown}
          placeholder="Untitled"
          value={draft}
        />
        {accessory ? <div className="flex shrink-0 items-center gap-1.5">{accessory}</div> : null}
      </div>
    </li>
  );
}

interface TaskListGhostRowProps {
  depth: number;
  onCreateTask: (name: string, templateId: string | null) => void | Promise<void>;
  onArrowUp?: () => void;
  templateOptions: SelectOption[];
}

function TaskListGhostRow(props: TaskListGhostRowProps) {
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [templateId, setTemplateId] = useState('none');

  const handleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (busy) {
        return;
      }
      setBusy(true);
      try {
        await props.onCreateTask(draft, templateId === 'none' ? null : templateId);
        setDraft('');
      } finally {
        setBusy(false);
      }
      return;
    }
    if (event.key === 'ArrowUp' && props.onArrowUp !== undefined) {
      event.preventDefault();
      props.onArrowUp();
    }
  };

  return (
    <li>
      <div
        className="flex w-full items-center gap-2 rounded-lg py-1.5 text-[12px] leading-4 text-content-muted opacity-60 transition-opacity hover:opacity-100 focus-within:opacity-100"
        style={{ paddingLeft: indentPaddingPx(props.depth), paddingRight: 12 }}
      >
        <span className="inline-block w-3.5 shrink-0" />
        <TaskStatusIcon status="open" size="sm" />
        {props.templateOptions.length > 0 ? (
          <Select
            options={[{ value: 'none', label: 'No template' }, ...props.templateOptions]}
            value={templateId}
            onChange={(value) => setTemplateId(value)}
            variant="borderless"
          />
        ) : null}
        <input
          aria-label="New task name"
          className="flex-1 truncate bg-transparent font-heading font-normal tracking-[0.08em] text-current outline-none"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => void handleKeyDown(event)}
          placeholder="Add a task — press Enter"
          value={draft}
        />
      </div>
    </li>
  );
}

function indentPaddingPx(depth: number): number {
  return 8 + depth * 16;
}
