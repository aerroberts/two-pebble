import { Button, IconButton, Input, Section, Surface } from '@two-pebble/components';
import { WorktreesList } from './worktrees-list';

interface RepositorySettingsContentProps {
  baseBranch: string;
  creatingWorktree: boolean;
  name: string;
  onBaseBranchBlur: () => void;
  onBaseBranchChange: (value: string) => void;
  onCreateWorktreeClick: () => void;
  onDeleteRepositoryClick: () => void;
  onDeleteWorktreeClick: (worktreeId: string) => void;
  onNameBlur: () => void;
  onNameChange: (value: string) => void;
  onPathBlur: () => void;
  onPathChange: (value: string) => void;
  path: string;
  worktreeEntries: Parameters<typeof WorktreesList>[0]['entries'];
  worktreeError: string;
  worktreesLoading: boolean;
}

export function RepositorySettingsContent(props: RepositorySettingsContentProps) {
  return (
    <>
      <Section
        actionItems={
          <IconButton
            aria-label="Delete repository"
            icon="trash-2"
            onClick={props.onDeleteRepositoryClick}
            type="button"
          />
        }
        title="Configure"
      >
        <Surface>
          <Input
            label="Name"
            onBlur={props.onNameBlur}
            onChange={(event) => props.onNameChange(event.target.value)}
            value={props.name}
          />
          <Input
            label="Local clone path"
            onBlur={props.onPathBlur}
            onChange={(event) => props.onPathChange(event.target.value)}
            placeholder="/Users/me/code/my-repo"
            value={props.path}
          />
          <Input
            label="Base branch"
            onBlur={props.onBaseBranchBlur}
            onChange={(event) => props.onBaseBranchChange(event.target.value)}
            placeholder="main"
            value={props.baseBranch}
          />
        </Surface>
      </Section>
      <Section
        actionItems={
          <Button disabled={props.creatingWorktree} leftIcon="plus" onClick={props.onCreateWorktreeClick} type="button">
            Create worktree
          </Button>
        }
        title="Worktrees"
      >
        {props.worktreeError.length > 0 ? <Surface>{props.worktreeError}</Surface> : null}
        <WorktreesList
          entries={props.worktreeEntries}
          loading={props.worktreesLoading}
          onDeleteClick={props.onDeleteWorktreeClick}
        />
      </Section>
    </>
  );
}
