import { Button, Header, PageLayout, Section, Surface } from '@two-pebble/components';
import { RepositoriesList } from './repositories-list';
import { useRepositoriesPageState } from './use-repositories-page-state';

export function RepositoriesPage() {
  const state = useRepositoriesPageState();

  return (
    <PageLayout width="fixed">
      <Header subtitle="Local git repositories the daemon can spin up worktrees in so each agent run can edit code in isolation.">
        Repositories
      </Header>
      <Section
        actionItems={
          <Button
            disabled={state.creating}
            leftIcon="plus"
            onClick={() => void state.createNewRepository()}
            type="button"
          >
            Add repository
          </Button>
        }
        title="Repositories"
      >
        {state.createError.length > 0 ? <Surface>{state.createError}</Surface> : null}
        <RepositoriesList
          onRepositoryClick={(repositoryId) => state.navigate(`/configuration/repositories/${repositoryId}`)}
          repositories={state.repositories}
        />
      </Section>
    </PageLayout>
  );
}
