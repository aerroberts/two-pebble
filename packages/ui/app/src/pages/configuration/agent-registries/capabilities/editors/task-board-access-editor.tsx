import { Select, Surface } from '@two-pebble/components';
import { useTaskBoards } from '@two-pebble/realtime';
import type { CapabilityEditorProps } from '../known-capabilities';
import type { TaskBoardAccessConfig } from '../types';

/**
 * Inline editor for the `task-board-access` capability. Shows a select
 * populated from the user's existing task boards. The boardId is the
 * only config knob, so the editor is intentionally tiny.
 */
export function TaskBoardAccessEditor(props: CapabilityEditorProps<TaskBoardAccessConfig>) {
  const boards = useTaskBoards();
  const options = boards.values().map((board) => ({ value: board.id, label: board.name || board.id }));
  const status = boards.status;
  const hasBoards = options.length > 0;
  const placeholder = hasBoards ? 'Pick a board' : status === 'loading' ? 'Loading boards…' : 'No boards yet';
  return (
    <>
      {!hasBoards ? <Surface>Create a board first from the Tasks page to attach this capability.</Surface> : null}
      <Select
        options={options}
        value={props.config.boardId || undefined}
        placeholder={placeholder}
        disabled={!hasBoards}
        searchable
        fullWidth
        onChange={(value) => props.onChange({ boardId: value })}
      />
    </>
  );
}
