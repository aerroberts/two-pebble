import { Header } from '../../content/header/header';
import { Section } from '../../content/section/section';
import { Table } from '../../data/table/table';
import { SidebarLayout } from '../../layout/sidebar-layout/sidebar-layout';
import { agentColumns, agentRows } from './agent-columns';
import { OperationsSidebar } from './operations-sidebar';

/**
 * Sample operations page with header + sidebar layout showing agents.
 */
export function OperationsPage() {
  return (
    <SidebarLayout sidebar={<OperationsSidebar />}>
      <div className="px-8 py-6 overflow-auto">
        <Header>Agents</Header>
        <Section title="Running Agents">
          <Table columns={agentColumns} rows={agentRows} getRowKey={(row) => row.name} />
        </Section>
      </div>
    </SidebarLayout>
  );
}
