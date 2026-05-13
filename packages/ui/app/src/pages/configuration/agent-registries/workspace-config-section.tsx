import { Input, Section, Select, type SelectOption, Surface } from '@two-pebble/components';
import type { LoadableRegistry, RepositoryRecord, WorkspaceConfig, WorkspaceConfigKind } from '@two-pebble/realtime';

interface WorkspaceConfigSectionProps {
  config: WorkspaceConfig;
  onFixedPathChange: (path: string) => void;
  onKindChange: (kind: WorkspaceConfigKind) => void;
  onRepositoryChange: (repositoryId: string) => void;
  repositories: LoadableRegistry<RepositoryRecord>;
  allowNone: boolean;
}

const NONE_OPTION: SelectOption = { label: 'No workspace', value: 'none' };
const BASE_KIND_OPTIONS: SelectOption[] = [
  { label: 'Absolute directory', value: 'absolute' },
  { label: 'Worktree off a repository', value: 'worktree' },
];

export function WorkspaceConfigSection(props: WorkspaceConfigSectionProps) {
  const KIND_OPTIONS: SelectOption[] = props.allowNone ? [NONE_OPTION, ...BASE_KIND_OPTIONS] : BASE_KIND_OPTIONS;
  const repositoryOptions = props.repositories
    .values()
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((repository) => ({
      label: repository.name.length > 0 ? repository.name : 'Untitled repository',
      value: repository.id,
    }));

  return (
    <Section subtitle="Where the agent runs when launched." title="Workspace">
      <Surface>
        <Select
          fullWidth
          label="Kind"
          onChange={(value) => props.onKindChange(value as WorkspaceConfigKind)}
          options={KIND_OPTIONS}
          value={props.config.kind}
        />
        {props.config.kind === 'absolute' ? (
          <Input
            label="Path"
            onChange={(event) => props.onFixedPathChange(event.target.value)}
            placeholder="/absolute/path/to/workspace"
            value={props.config.path}
          />
        ) : null}
        {props.config.kind === 'worktree' ? (
          <Select
            fullWidth
            label="Repository"
            onChange={props.onRepositoryChange}
            options={repositoryOptions}
            placeholder={props.repositories.status === 'loading' ? 'Loading repositories' : 'Select repository'}
            value={props.config.repositoryId}
          />
        ) : null}
      </Surface>
    </Section>
  );
}
