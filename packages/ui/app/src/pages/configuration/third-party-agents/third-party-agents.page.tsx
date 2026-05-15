import {
  Button,
  ClaudeCodeLogo,
  CodexLogo,
  Header,
  ListLayout,
  PageLayout,
  Row,
  Section,
  Surface,
} from '@two-pebble/components';
import type { ThirdPartyAgentInstallRecord } from '@two-pebble/realtime';
import { useThirdPartyAgentsPageState } from './use-third-party-agents-page-state';

export function ThirdPartyAgentsPage() {
  const state = useThirdPartyAgentsPageState();
  const installs = state.installs.entries();

  return (
    <PageLayout width="fixed">
      <Header>Third-party agents</Header>
      <Section
        actionItems={
          <Row gap="sm">
            <Button
              disabled={state.detecting}
              leftIcon="zap"
              onClick={() => void state.detectClaudeCode()}
              type="button"
              variant="secondary"
            >
              {state.detecting ? 'Detecting' : 'Detect Claude Code'}
            </Button>
            <Button
              disabled={state.detecting}
              leftIcon="zap"
              onClick={() => void state.detectCodex()}
              type="button"
              variant="secondary"
            >
              {state.detecting ? 'Detecting' : 'Detect Codex'}
            </Button>
            <Button
              disabled={state.creating}
              leftIcon="plus"
              onClick={() => void state.createBlankInstall()}
              type="button"
            >
              {state.creating ? 'Adding' : 'Add install'}
            </Button>
          </Row>
        }
        title="Installs"
      >
        {state.actionError.length > 0 ? <Surface>{state.actionError}</Surface> : null}
        <ListLayout
          emptyState={state.installs.status === 'loading' ? 'Loading installs.' : 'No installs created.'}
          items={installs.map((entry) => buildInstallListItem(entry.value, state.navigate))}
        />
      </Section>
    </PageLayout>
  );
}

interface InstallListItem {
  icon: JSX.Element;
  key: string;
  onClick: () => void;
  subtitle: string;
  title: string;
}

type NavigateFn = (path: string) => void;

function buildInstallListItem(install: ThirdPartyAgentInstallRecord, navigate: NavigateFn): InstallListItem {
  return {
    icon: install.frameworkId === 'codex' ? <CodexLogo size="xs" /> : <ClaudeCodeLogo size="xs" />,
    key: install.id,
    onClick: () => navigate(`/configuration/third-party-agents/${install.id}`),
    subtitle: install.data.executablePath.length > 0 ? install.data.executablePath : 'No executable path configured',
    title: install.name.length > 0 ? install.name : 'Untitled install',
  };
}
