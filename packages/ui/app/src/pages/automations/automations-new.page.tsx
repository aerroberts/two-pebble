import {
  Button,
  ButtonGroup,
  Checkbox,
  Header,
  Input,
  InputArea,
  PageLayout,
  Section,
  Select,
  Surface,
} from '@two-pebble/components';
import { type AutomationIntervalUnit, useCreateAutomation, useProjectAgentRegistries } from '@two-pebble/realtime';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectPath, useProjectId } from '../../project-context';

interface ScheduleOption {
  value: string;
  label: string;
  intervalUnit: AutomationIntervalUnit;
  intervalValue: number;
}

const scheduleOptions: ScheduleOption[] = [
  { value: 'manual', label: 'Manual', intervalUnit: 'manual', intervalValue: 1 },
  { value: '1:hours', label: 'Every 1 hour', intervalUnit: 'hours', intervalValue: 1 },
  { value: '4:hours', label: 'Every 4 hours', intervalUnit: 'hours', intervalValue: 4 },
  { value: '1:days', label: 'Every 1 day', intervalUnit: 'days', intervalValue: 1 },
];

function toScheduleValue(intervalUnit: AutomationIntervalUnit, intervalValue: number): string {
  if (intervalUnit === 'manual') {
    return 'manual';
  }
  const match = scheduleOptions.find((o) => o.intervalUnit === intervalUnit && o.intervalValue === intervalValue);
  return match?.value ?? 'manual';
}

export function AutomationsNewPage() {
  const navigate = useNavigate();
  const projectId = useProjectId();
  const createAutomation = useCreateAutomation();
  const agentRegistries = useProjectAgentRegistries(projectId);
  const registryOptions = agentRegistries.values().map((registry) => ({ label: registry.name, value: registry.id }));
  const [name, setName] = useState('');
  const [agentRegistryId, setAgentRegistryId] = useState('');
  const [message, setMessage] = useState('');
  const [intervalUnit, setIntervalUnit] = useState<AutomationIntervalUnit>('manual');
  const [intervalValue, setIntervalValue] = useState(1);
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const saveDisabled = saving || name.trim().length === 0 || agentRegistryId.length === 0;

  const handleScheduleChange = (value: string) => {
    const option = scheduleOptions.find((o) => o.value === value);
    if (option) {
      setIntervalUnit(option.intervalUnit);
      setIntervalValue(option.intervalValue);
    }
  };

  const handleSave = async () => {
    if (saveDisabled) {
      return;
    }
    setSaving(true);
    try {
      const result = await createAutomation({
        agentRegistryId,
        enabled,
        intervalUnit,
        intervalValue,
        message,
        name: name.trim(),
      });
      navigate(projectPath(projectId, `/automations/${result.id}`));
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout width="fixed">
      <Header subtitle="Create a heartbeat-driven agent launch.">New automation</Header>
      <Section title="Configure">
        <Surface>
          <Input label="Name" onChange={(event) => setName(event.target.value)} value={name} />
          <Select
            fullWidth
            label="Agent"
            onChange={setAgentRegistryId}
            options={registryOptions}
            placeholder={agentRegistries.status === 'loading' ? 'Loading agents' : 'Select agent'}
            value={agentRegistryId}
          />
          <InputArea label="Message" onChange={(event) => setMessage(event.target.value)} value={message} />
          <ButtonGroup
            label="Schedule"
            onChange={handleScheduleChange}
            options={scheduleOptions}
            value={toScheduleValue(intervalUnit, intervalValue)}
          />
          <Checkbox checked={enabled} label="Enabled" onChange={(event) => setEnabled(event.target.checked)} />
          <Button disabled={saveDisabled} leftIcon="save" onClick={() => void handleSave()}>
            {saving ? 'Saving' : 'Create automation'}
          </Button>
        </Surface>
      </Section>
    </PageLayout>
  );
}
