import { AppBox, AuxiliarySidebarLayout, Sidebar, SidebarOption, SidebarSection } from '@two-pebble/components';
import { type AutomationRecord, useAutomations } from '@two-pebble/realtime';
import { CircleSlash, MousePointerClick } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatCadenceLabel } from '../pages/automations/automation-format';
import type { AppShellProps } from './app-shell-props';
import { MainAppShell } from './main-app-shell';

function AutomationBadge({ automation }: { automation: AutomationRecord }) {
  if (!automation.enabled) {
    return (
      <span className="inline-flex items-center opacity-40" title="Disabled">
        <CircleSlash size={12} />
      </span>
    );
  }
  if (automation.intervalUnit === 'manual') {
    return (
      <span className="inline-flex items-center" title="Manual">
        <MousePointerClick size={12} />
      </span>
    );
  }
  return (
    <span
      className="font-mono text-[10px] font-semibold"
      title={`Every ${automation.intervalValue} ${automation.intervalUnit}`}
    >
      {formatCadenceLabel(automation)}
    </span>
  );
}

export function AutomationsAppShell(props: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const automations = useAutomations();
  const list = automations.values().sort((left, right) => left.name.localeCompare(right.name));

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
            <SidebarSection title="Automations">
              {list.length === 0 ? (
                <AppBox variant="sidebar-empty">No automations.</AppBox>
              ) : (
                list.map((automation) => (
                  <SidebarOption
                    active={location.pathname === `/automations/${automation.id}`}
                    badge={<AutomationBadge automation={automation} />}
                    icon={automation.intervalUnit === 'manual' ? 'play' : 'clock'}
                    key={automation.id}
                    label={automation.name}
                    onClick={() => navigate(`/automations/${automation.id}`)}
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
