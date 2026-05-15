import { Button, Header, IconButton, Input, PageLayout, Row, Section, Surface } from '@two-pebble/components';
import { Navigate } from 'react-router-dom';
import { useThirdPartyAgentSettingsPageState } from './use-third-party-agent-settings-page-state';

export function ThirdPartyAgentSettingsPage() {
  const state = useThirdPartyAgentSettingsPageState();

  if (state.redirectToList) {
    return <Navigate to="/configuration/third-party-agents" replace />;
  }

  if (state.install === null || state.install.value === null) {
    return (
      <PageLayout width="fixed">
        <Header>Third-party agents</Header>
        <Section title="Configure">
          <Surface>Loading install.</Surface>
        </Section>
      </PageLayout>
    );
  }

  return (
    <PageLayout width="fixed">
      <Header>Third-party agents</Header>
      <Section
        actionItems={
          <IconButton aria-label="Delete install" icon="trash-2" onClick={state.deleteSelectedInstall} type="button" />
        }
        title="Configure"
      >
        <Surface>
          <Input
            label="Name"
            onBlur={state.updateName}
            onChange={(event) => state.setName(event.target.value)}
            value={state.name}
          />
          <Input
            label="Executable path"
            onBlur={state.updateExecutablePath}
            onChange={(event) => state.setExecutablePath(event.target.value)}
            placeholder={state.install.value.frameworkId === 'codex' ? '/usr/local/bin/codex' : '/usr/local/bin/claude'}
            value={state.executablePath}
          />
          <Row gap="sm">
            <Button
              disabled={state.detecting}
              leftIcon="zap"
              onClick={() => void state.detectAndFillPath()}
              type="button"
              variant="secondary"
            >
              {state.detecting ? 'Detecting' : 'Detect on PATH'}
            </Button>
          </Row>
          {state.actionError.length > 0 ? <Surface>{state.actionError}</Surface> : null}
        </Surface>
      </Section>
    </PageLayout>
  );
}
