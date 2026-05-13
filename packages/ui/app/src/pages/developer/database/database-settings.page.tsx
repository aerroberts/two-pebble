import { Button, Header, PageLayout, Section, Surface, Table, type TableColumn } from '@two-pebble/components';
import { useDescribeDatabase, useRealtimeDatastore } from '@two-pebble/realtime';

interface DatabaseTableRow {
  name: string;
  rowCount: number;
  sizeBytes: number;
}

const tableColumns: TableColumn<DatabaseTableRow>[] = [
  { id: 'name', header: 'Table', cell: (row) => row.name },
  { id: 'rows', header: 'Rows', align: 'right', cell: (row) => row.rowCount.toLocaleString() },
  { id: 'size', header: 'Size on disk', align: 'right', cell: (row) => formatBytes(row.sizeBytes) },
];

export function DatabaseSettingsPage() {
  const datastore = useRealtimeDatastore();
  const database = useDescribeDatabase();

  const handleMigrate = async () => {
    await datastore.database.migrate();
    database.refresh();
  };

  const tableRows = [...(database.description?.tables ?? [])].sort((left, right) => right.sizeBytes - left.sizeBytes);

  return (
    <PageLayout width="fixed">
      <Header
        actionItems={
          <>
            <Button leftIcon="folder-open" onClick={() => void datastore.database.open()}>
              Open database on disk
            </Button>
            <Button leftIcon="database" onClick={() => void handleMigrate()}>
              Run migration
            </Button>
          </>
        }
        subtitle="Two Pebble stores local daemon state in SQLite, accessed through Drizzle ORM and the libSQL client, with migrations keeping the schema current."
      >
        Database
      </Header>
      <Section>
        {database.status === 'loading' ? <Surface>Loading database tables.</Surface> : null}
        {database.status === 'error' ? <Surface>Could not describe database.</Surface> : null}
        {database.status === 'ready' ? (
          <Table columns={tableColumns} rows={tableRows} getRowKey={(row) => row.name} />
        ) : null}
      </Section>
    </PageLayout>
  );
}

function formatBytes(sizeBytes: number) {
  if (sizeBytes < 1024) {
    return `${sizeBytes} B`;
  }

  if (sizeBytes < 1024 * 1024) {
    return `${(sizeBytes / 1024).toFixed(1)} KB`;
  }

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
}
