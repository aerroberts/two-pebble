import { Header, PageLayout, Section, Surface } from '@two-pebble/components';
import { useWorktrees } from '@two-pebble/realtime';
import { Navigate } from 'react-router-dom';
import { RepositorySettingsContent } from './repository-settings-content';
import { useRepositorySettingsPageState } from './use-repository-settings-page-state';

export function RepositorySettingsPage() {
  const state = useRepositorySettingsPageState();
  const worktrees = useWorktrees();

  if (state.redirectToRepositories) {
    return <Navigate replace to="/configuration/repositories" />;
  }

  if (state.repository === null || state.repository.value === null) {
    return (
      <PageLayout width="fixed">
        <Header>Repositories</Header>
        <Section title="Repository">
          <Surface>Loading repository.</Surface>
        </Section>
      </PageLayout>
    );
  }

  return (
    <PageLayout width="fixed">
      <Header>Repositories</Header>
      <RepositorySettingsContent
        baseBranch={state.baseBranch}
        creatingWorktree={state.creatingWorktree}
        name={state.name}
        onBaseBranchBlur={state.updateBaseBranch}
        onBaseBranchChange={state.setBaseBranch}
        onCreateWorktreeClick={() => void state.createNewWorktree()}
        onDeleteRepositoryClick={state.deleteSelectedRepository}
        onDeleteWorktreeClick={state.deleteSelectedWorktree}
        onNameBlur={state.updateName}
        onNameChange={state.setName}
        onPathBlur={state.updatePath}
        onPathChange={state.setPath}
        path={state.path}
        worktreeEntries={state.repositoryWorktrees}
        worktreeError={state.worktreeError}
        worktreesLoading={worktrees.status === 'loading'}
      />
    </PageLayout>
  );
}
