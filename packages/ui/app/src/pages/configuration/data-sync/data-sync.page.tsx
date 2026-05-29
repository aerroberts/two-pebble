import { Button, Checkbox, Header, Input, PageLayout, Section, Surface } from '@two-pebble/components';
import { ReconcileTable } from './reconcile-table';
import { useDataSyncPageState } from './use-data-sync-page-state';

export function DataSyncPage() {
  const state = useDataSyncPageState();

  return (
    <PageLayout width="fixed">
      <Header subtitle="Share configuration and documents between app instances through a local folder. Export writes this instance to disk; import pulls disk into this instance. You review and choose what to apply.">
        Data Sync
      </Header>

      <Section title="Sync directory">
        {state.error.length > 0 ? <Surface>{state.error}</Surface> : null}
        <Surface>
          <Input
            label="Folder"
            placeholder="/path/to/shared/folder"
            value={state.directory}
            onChange={(event) => state.setDirectory(event.target.value)}
            onBlur={() => void state.saveDirectory()}
          />
        </Surface>
      </Section>

      <Section
        title="Build a plan"
        actionItems={
          <div className="flex gap-2">
            <Button disabled={state.busy} leftIcon="save" onClick={() => void state.build('export')} type="button">
              Export
            </Button>
            <Button
              disabled={state.busy}
              leftIcon="inbox"
              onClick={() => void state.build('import')}
              type="button"
              variant="secondary"
            >
              Import
            </Button>
          </div>
        }
      >
        <Surface>
          <div className="flex flex-col gap-2">
            <span className="text-[12px] text-content-muted">
              Export scope (leave all unchecked to include every project; repositories are always global):
            </span>
            <div className="flex flex-wrap gap-3">
              {state.projectNames.map((name) => (
                <Checkbox
                  key={name}
                  label={name}
                  checked={state.selectedProjects.includes(name)}
                  onChange={() => state.toggleProject(name)}
                />
              ))}
            </div>
          </div>
        </Surface>
      </Section>

      {state.summary !== null ? (
        <Section title="Result">
          <Surface>
            {state.summary.direction === 'export'
              ? `Wrote ${state.summary.applied} record(s) to disk; removed ${state.summary.orphansRemoved} orphan file(s).`
              : `Imported ${state.summary.applied} record(s); skipped ${state.summary.skipped}.`}
            {state.summary.warnings.length > 0 ? (
              <div className="mt-2 flex flex-col gap-1">
                {state.summary.warnings.map((warning) => (
                  <span key={warning} className="text-[12px] text-amber-600">
                    {warning}
                  </span>
                ))}
              </div>
            ) : null}
          </Surface>
        </Section>
      ) : null}

      {state.plan !== null ? (
        <Section
          title="Review"
          actionItems={
            <div className="flex gap-2">
              <Button disabled={state.busy} leftIcon="check" onClick={() => void state.apply()} type="button">
                Apply
              </Button>
              <Button disabled={state.busy} onClick={() => state.discardPlan()} type="button" variant="secondary">
                Cancel
              </Button>
            </div>
          }
        >
          <ReconcileTable plan={state.plan} onToggle={state.toggleEntry} />
        </Section>
      ) : null}
    </PageLayout>
  );
}
