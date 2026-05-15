import { Sidebar } from '../../navigation/sidebar/sidebar';
import { SidebarOption } from '../../navigation/sidebar-option/sidebar-option';
import { SidebarSection } from '../../navigation/sidebar-section/sidebar-section';

export interface AgentControlSidebarProps {
  activeItem?: string;
}

export function AgentControlSidebar(props: AgentControlSidebarProps) {
  const active = props.activeItem ?? 'overview';

  return (
    <Sidebar>
      <SidebarSection title="Runtime">
        <SidebarOption label="Overview" active={active === 'overview'} />
        <SidebarOption label="Runs" badge="3" active={active === 'runs'} />
        <SidebarOption label="Agents" badge="5" active={active === 'agents'} />
        <SidebarOption label="Traces" badge="12" active={active === 'traces'} />
      </SidebarSection>
      <SidebarSection title="Configuration">
        <SidebarOption label="Providers" active={active === 'providers'} />
        <SidebarOption label="Models" active={active === 'models'} />
        <SidebarOption label="Datastore" active={active === 'datastore'} />
      </SidebarSection>
    </Sidebar>
  );
}
