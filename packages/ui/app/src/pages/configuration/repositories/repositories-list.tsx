import { GitLogo, ListLayout } from '@two-pebble/components';
import type { LoadableRegistry, RepositoryRecord } from '@two-pebble/realtime';

interface RepositoriesListProps {
  repositories: LoadableRegistry<RepositoryRecord>;
  onRepositoryClick: (repositoryId: string) => void;
}

export function RepositoriesList(props: RepositoriesListProps) {
  return (
    <ListLayout
      emptyState={props.repositories.status === 'loading' ? 'Loading repositories.' : 'No repositories registered.'}
      items={props.repositories.entries().map((repository) => ({
        icon: <GitLogo size="xs" />,
        key: repository.id,
        onClick: () => props.onRepositoryClick(repository.id),
        subtitle: repository.value.path.length > 0 ? repository.value.path : 'No path set',
        title: repository.value.name.length > 0 ? repository.value.name : 'Untitled repository',
        value: repository.value.baseBranch,
      }))}
    />
  );
}
