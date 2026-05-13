import { Header } from '../../content/header/header';
import { Section } from '../../content/section/section';
import { DataPanelLayout } from '../../layout/data-panel-layout/data-panel-layout';
import { SidebarLayout } from '../../layout/sidebar-layout/sidebar-layout';
import { TraceDetailPanel } from './trace-detail-panel';
import { TraceDetailSidebar } from './trace-detail-sidebar';

/**
 * Sample trace detail page with header + sidebar + data panel.
 */
export function TraceDetailPage() {
  return (
    <SidebarLayout sidebar={<TraceDetailSidebar />}>
      <DataPanelLayout open panel={<TraceDetailPanel />}>
        <div className="px-8 py-6 overflow-auto">
          <Header subtitle="A single agent run with message, tool, and model-call context.">0042</Header>
          <Section title="Summary">
            <p className="text-sm leading-6 text-content-muted">
              The assistant processed the user prompt, registered local tools, called the model, and returned a concise
              status update.
            </p>
          </Section>
          <Section title="Turn Sequence">
            <ol className="flex flex-col gap-2 text-sm leading-6 text-content-muted list-decimal pl-5">
              <li>User message appended to the Pebble thread.</li>
              <li>Tool registry mounted for the run.</li>
              <li>Assistant response serialized back into cells.</li>
            </ol>
          </Section>
        </div>
      </DataPanelLayout>
    </SidebarLayout>
  );
}
