import { Sidebar } from '../../navigation/sidebar/sidebar';
import { SidebarOption } from '../../navigation/sidebar-option/sidebar-option';
import { SidebarSection } from '../../navigation/sidebar-section/sidebar-section';

export interface OperationsSidebarProps {
  activeItem?: string;
}

export function OperationsSidebar(props: OperationsSidebarProps) {
  const active = props.activeItem ?? 'agents';

  return (
    <Sidebar>
      <SidebarSection title="Infrastructure" icon="server">
        <SidebarOption label="Agents" badge="8" active={active === 'agents'} />
        <SidebarOption label="Containers" badge="4" active={active === 'containers'} />
        <SidebarOption label="Databases" active={active === 'databases'} />
      </SidebarSection>
      <SidebarSection title="Workloads" icon="activity">
        <SidebarOption label="Jobs" badge="12" active={active === 'jobs'} />
        <SidebarOption label="Usage" active={active === 'usage'} />
        <SidebarOption label="Errors" badge="2" active={active === 'errors'} />
      </SidebarSection>
    </Sidebar>
  );
}
