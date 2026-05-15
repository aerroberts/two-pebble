import {
  Button,
  Checkbox,
  Header,
  Input,
  InputArea,
  PageLayout,
  Section,
  Select,
  Surface,
} from '@two-pebble/components';
import { type AutomationIntervalUnit, useAgentRegistries, useCreateAutomation } from '@two-pebble/realtime';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const intervalOptions = [
  { label: 'Manual', value: 'manual' },
  { label: 'Minutes', value: 'minutes' },
  { label: 'Hours', value: 'hours' },
  { label: 'Days', value: 'days' },
];

export function AutomationsNewPage() {
  const navigate = useNavigate();
  const createAutomation = useCreateAutomation();
  const agentRegistries = useAgentRegistries();
  const registryOptions = agentRegistries.values().map((registry) => ({ label: registry.name, value: registry.id }));
  const [name, setName] = useState('');
  const [agentRegistryId, setAgentRegistryId] = useState('');
  const [message, setMessage] = useState('');
  const [intervalUnit, setIntervalUnit] = useState<AutomationIntervalUnit>('manual');
  const [intervalValue, setIntervalValue] = useState(1);
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const saveDisabled = saving || name.trim().length === 0 || agentRegistryId.length === 0;

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
      navigate(`/automations/${result.id}`);
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
          <Select
            fullWidth
            label="Interval"
            onChange={(value) => setIntervalUnit(value as AutomationIntervalUnit)}
            options={intervalOptions}
            value={intervalUnit}
          />
          {intervalUnit === 'manual' ? null : (
            <Input
              label="Interval value"
              min={1}
              onChange={(event) => setIntervalValue(Number(event.target.value))}
              type="number"
              value={intervalValue}
            />
          )}
          <Checkbox checked={enabled} label="Enabled" onChange={(event) => setEnabled(event.target.checked)} />
          <Button disabled={saveDisabled} leftIcon="save" onClick={() => void handleSave()}>
            {saving ? 'Saving' : 'Create automation'}
          </Button>
        </Surface>
      </Section>
    </PageLayout>
  );
}
