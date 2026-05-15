import {
  AppRevealIconButton,
  Button,
  ConcurrencyIndicator,
  Header,
  ListLayout,
  PageLayout,
  Surface,
} from '@two-pebble/components';
import { useGlobalConcurrency } from '../../shared/concurrency/use-global-concurrency';
import { useTasksPageState } from './use-tasks-page-state';

export function TasksPage() {
  const state = useTasksPageState();
  const concurrency = useGlobalConcurrency();
  const boards = state.taskBoards.values();

  return (
    <PageLayout width="fixed">
      <Header
        actionItems={
          <>
            <ConcurrencyIndicator count={concurrency.count} intensity={concurrency.intensity} />
            <Button disabled={state.creating} leftIcon="plus" onClick={state.onCreateBoard}>
              Create board
            </Button>
          </>
        }
        subtitle="Track work across boards, pools, and tasks with declarative dependencies."
      >
        Tasks
      </Header>
      {state.error.length > 0 ? <Surface>{state.error}</Surface> : null}
      <ListLayout
        emptyState="No boards yet. Click Create board to start one."
        items={boards.map((board) => ({
          key: board.id,
          onClick: () => state.navigate(`/tasks/${board.id}`),
          title: board.name,
          trailingAccessory: (
            <AppRevealIconButton
              aria-label={`Delete ${board.name}`}
              icon="trash-2"
              variant="secondary"
              onClick={() => void state.deleteBoard(board.id)}
              reveal
            />
          ),
        }))}
      />
    </PageLayout>
  );
}
