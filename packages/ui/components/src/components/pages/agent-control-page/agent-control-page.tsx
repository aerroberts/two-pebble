import { Header } from '../../content/header/header';
import { Section } from '../../content/section/section';
import { ListLayout } from '../../data/list-layout/list-layout';
import { SidebarLayout } from '../../layout/sidebar-layout/sidebar-layout';
import { AgentControlSidebar } from './agent-control-sidebar';

/**
 * Sample agent control page with header + sidebar layout.
 */
export function AgentControlPage() {
  return (
    <SidebarLayout sidebar={<AgentControlSidebar />}>
      <div className="px-8 py-6 overflow-auto">
        <Header subtitle="Live runtime state for local agents, providers, and traces.">Agent Console</Header>
        <Section title="Summary">
          <ListLayout
            items={[
              { icon: 'play', title: 'Active Runs', value: '3' },
              { icon: 'bot', title: 'Agents', value: '5' },
              { icon: 'brain', title: 'Model Calls', value: '12' },
            ]}
          />
        </Section>
        <Section title="Recent Activity">
          <ListLayout
            items={[
              { icon: 'message-square', title: 'User message received', subtitle: 'agent-run-0042', value: 'now' },
              { icon: 'wrench', title: 'Tools registered', subtitle: 'filesystem, datastore', value: '3' },
              { icon: 'cpu', title: 'Model call completed', subtitle: 'gpt-5.4-mini', value: '820 ms' },
              { icon: 'file-text', title: 'Thread serialized', subtitle: '4 turns', value: 'ok' },
            ]}
          />
        </Section>
      </div>
    </SidebarLayout>
  );
}
