import { AppBox, AuxiliarySidebarLayout, Sidebar, SidebarOption, SidebarSection } from '@two-pebble/components';
import { type AutomationRecord, useAutomations } from '@two-pebble/realtime';
import { useLocation, useNavigate } from 'react-router-dom';
import type { AppShellProps } from './app-shell-props';
import { MainAppShell } from './main-app-shell';

export function AutomationsAppShell(props: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const automations = useAutomations();
  const list = automations.values().sort((left, right) => left.name.localeCompare(right.name));
  const active = list.filter((automation) => automation.enabled && automation.intervalUnit !== 'manual');
  const manual = list.filter((automation) => automation.enabled && automation.intervalUnit === 'manual');
  const disabled = list.filter((automation) => !automation.enabled);

  return (
    <MainAppShell>
      <AuxiliarySidebarLayout
        sidebar={
          <Sidebar>
            <SidebarOption
              active={location.pathname === '/automations/new'}
              icon="plus"
              label="New automation"
              onClick={() => navigate('/automations/new')}
            />
            <AutomationSection
              automations={active}
              locationPathname={location.pathname}
              navigate={navigate}
              title="Active"
            />
            <AutomationSection
              automations={manual}
              locationPathname={location.pathname}
              navigate={navigate}
              title="Manual"
            />
            <AutomationSection
              automations={disabled}
              defaultCollapsed
              locationPathname={location.pathname}
              navigate={navigate}
              title="Disabled"
            />
          </Sidebar>
        }
      >
        {props.children}
      </AuxiliarySidebarLayout>
    </MainAppShell>
  );
}

interface AutomationSectionProps {
  automations: AutomationRecord[];
  defaultCollapsed?: boolean;
  locationPathname: string;
  navigate: (path: string) => void;
  title: string;
}

function AutomationSection(props: AutomationSectionProps) {
  return (
    <SidebarSection collapsible defaultCollapsed={props.defaultCollapsed} title={props.title}>
      {props.automations.length === 0 ? (
        <AppBox variant="sidebar-empty">No automations.</AppBox>
      ) : (
        props.automations.map((automation) => (
          <SidebarOption
            active={props.locationPathname === `/automations/${automation.id}`}
            icon={automation.intervalUnit === 'manual' ? 'play' : 'clock'}
            key={automation.id}
            label={automation.name}
            onClick={() => props.navigate(`/automations/${automation.id}`)}
          />
        ))
      )}
    </SidebarSection>
  );
}
