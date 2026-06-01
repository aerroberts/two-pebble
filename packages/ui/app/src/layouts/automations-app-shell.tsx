import {
  AppBox,
  AutomationIndicator,
  type AutomationIndicatorState,
  AuxiliarySidebarLayout,
  Sidebar,
  SidebarOption,
  SidebarSection,
} from '@two-pebble/components';
import { type AutomationRecord, useAutomations } from '@two-pebble/realtime';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatCadenceLabel } from '../pages/automations/automation-format';
import { projectPath, useProjectId } from '../project-context';
import type { AppShellProps } from './app-shell-props';
import { MainAppShell } from './main-app-shell';

interface AutomationBadgeProps {
  automation: AutomationRecord;
}

function AutomationBadge(props: AutomationBadgeProps) {
  const automation = props.automation;
  const state: AutomationIndicatorState = !automation.enabled
    ? 'disabled'
    : automation.intervalUnit === 'manual'
      ? 'manual'
      : 'scheduled';

  return (
    <AutomationIndicator
      state={state}
      variant="badge"
      cadenceLabel={formatCadenceLabel(automation)}
      cadenceTitle={`Every ${automation.intervalValue} ${automation.intervalUnit}`}
    />
  );
}

export function AutomationsAppShell(props: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const projectId = useProjectId();
  const automations = useAutomations({ projectId });
  const list = automations.values().sort((left, right) => left.name.localeCompare(right.name));
  const activeCount = list.filter((automation) => automation.enabled).length;

  return (
    <MainAppShell>
      <AuxiliarySidebarLayout
        sidebar={
          <Sidebar
            footer={
              <SidebarOption
                active={location.pathname === projectPath(projectId, '/automations/new')}
                icon="plus"
                label="New automation"
                onClick={() => navigate(projectPath(projectId, '/automations/new'))}
              />
            }
          >
            <SidebarSection title={activeCount > 0 ? `Automations · ${activeCount} active` : 'Automations'}>
              {list.length === 0 ? (
                <AppBox variant="sidebar-empty">No automations.</AppBox>
              ) : (
                list.map((automation) => (
                  <SidebarOption
                    active={location.pathname === projectPath(projectId, `/automations/${automation.id}`)}
                    badge={<AutomationBadge automation={automation} />}
                    icon={automation.intervalUnit === 'manual' ? 'play' : 'clock'}
                    key={automation.id}
                    label={automation.name}
                    onClick={() => navigate(projectPath(projectId, `/automations/${automation.id}`))}
                  />
                ))
              )}
            </SidebarSection>
          </Sidebar>
        }
      >
        {props.children}
      </AuxiliarySidebarLayout>
    </MainAppShell>
  );
}
