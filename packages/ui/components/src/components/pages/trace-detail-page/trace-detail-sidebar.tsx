import { Sidebar } from '../../navigation/sidebar/sidebar';
import { SidebarOption } from '../../navigation/sidebar-option/sidebar-option';
import { SidebarSection } from '../../navigation/sidebar-section/sidebar-section';

export interface TraceDetailSidebarProps {
  activeItem?: string;
}

export function TraceDetailSidebar(props: TraceDetailSidebarProps) {
  const active = props.activeItem ?? 'trace-0042';

  return (
    <Sidebar>
      <SidebarSection title="Current Run" icon="activity">
        <SidebarOption label="0042" active={active === 'trace-0042'} />
        <SidebarOption label="0041" active={active === 'trace-0041'} />
      </SidebarSection>
      <SidebarSection title="Signals" icon="radio">
        <SidebarOption label="Model calls" active={active === 'model-calls'} />
        <SidebarOption label="Tool calls" active={active === 'tool-calls'} />
        <SidebarOption label="Serialized thread" active={active === 'thread'} />
      </SidebarSection>
      <SidebarSection title="Storage" icon="database">
        <SidebarOption label="Datastore rows" active={active === 'datastore'} />
        <SidebarOption label="Provider events" active={active === 'provider-events'} />
      </SidebarSection>
    </Sidebar>
  );
}
