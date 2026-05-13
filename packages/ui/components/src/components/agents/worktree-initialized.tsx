import { IconButton } from '../input/icon-button/icon-button';
import { AgentTraceItem } from './agent-trace-item';
import type { TraceComponentProps } from './types';

export function WorktreeInitializedTrace(props: TraceComponentProps<'worktree-initialized'>) {
  const { worktreeId } = props.trace.data;
  const openHandler = props.onWorktreeOpenClick;
  return (
    <AgentTraceItem
      icon="FolderOpen"
      status="atomic"
      timestamp={props.trace.createdAt}
      title="Worktree initialized"
      titleAction={
        openHandler === undefined ? undefined : (
          <IconButton
            aria-label="Open worktree directory"
            icon="folder-open"
            onClick={() => openHandler(worktreeId)}
            variant="secondary"
          />
        )
      }
    />
  );
}
