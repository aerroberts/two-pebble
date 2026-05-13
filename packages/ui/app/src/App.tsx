import { LoadingPage, NotConnectedPage } from '@two-pebble/components';
import { useRealtimeConnection } from '@two-pebble/realtime';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { AgentsAppShell } from './layouts/agents-app-shell';
import { ConfigurationAppShell } from './layouts/configuration-app-shell';
import { DeveloperAppShell } from './layouts/developer-app-shell';
import { MainAppShell } from './layouts/main-app-shell';
import { MetricsAppShell } from './layouts/metrics-app-shell';
import { AgentDetailPage } from './pages/agent-detail/agent-detail.page';
import { AgentsPage } from './pages/agents/agents.page';
import { AssistantPage } from './pages/assistant/assistant.page';
import { AgentRegistriesPage } from './pages/configuration/agent-registries/agent-registries.page';
import { AgentRegistrySettingsPage } from './pages/configuration/agent-registries/agent-registry-settings.page';
import { AssistantSettingsPage } from './pages/configuration/assistant/assistant-settings.page';
import { InferenceProfileSettingsPage } from './pages/configuration/inference-profiles/inference-profile-settings.page';
import { InferenceProfilesPage } from './pages/configuration/inference-profiles/inference-profiles.page';
import { IntegrationSettingsPage } from './pages/configuration/integrations/integration-settings.page';
import { IntegrationsPage } from './pages/configuration/integrations/integrations.page';
import { RepositoriesPage } from './pages/configuration/repositories/repositories.page';
import { RepositorySettingsPage } from './pages/configuration/repositories/repository-settings.page';
import { ThemeSettingsPage } from './pages/configuration/theme/theme-settings.page';
import { ThirdPartyAgentSettingsPage } from './pages/configuration/third-party-agents/third-party-agent-settings.page';
import { ThirdPartyAgentsPage } from './pages/configuration/third-party-agents/third-party-agents.page';
import { VoiceSettingsPage } from './pages/configuration/voice/voice-settings.page';
import { DaemonLogPage } from './pages/developer/daemon-logs/daemon-log.page';
import { DaemonLogsPage } from './pages/developer/daemon-logs/daemon-logs.page';
import { DatabaseSettingsPage } from './pages/developer/database/database-settings.page';
import { DeveloperThreadPage } from './pages/developer/threads/thread.page';
import { ThreadsPage } from './pages/developer/threads/threads.page';
import { MetricDetailPage } from './pages/metrics/metric-detail.page';
import { MetricsExplorerPage } from './pages/metrics/metrics-explorer.page';
import { PricingExplorerPage } from './pages/metrics/pricing-explorer.page';
import { PricingOverviewPage } from './pages/metrics/pricing-overview.page';
import { ModelCallDetailPage } from './pages/model-call-detail/model-call-detail.page';
import { TaskBoardPage } from './pages/task-board/task-board.page';
import { TasksPage } from './pages/tasks/tasks.page';

export function App() {
  const connection = useRealtimeConnection();

  if (connection.status === 'connecting') {
    return <LoadingPage />;
  }

  if (connection.status === 'not-connected') {
    return <NotConnectedPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/agents/new" replace />} />
      <Route
        path="/assistant"
        element={
          <MainAppShell>
            <AssistantPage />
          </MainAppShell>
        }
      />
      <Route path="/agents" element={<Navigate to="/agents/new" replace />} />
      <Route
        path="/agents/new"
        element={
          <AgentsAppShell>
            <AgentsPage />
          </AgentsAppShell>
        }
      />
      <Route
        path="/agents/:agentId"
        element={
          <AgentsAppShell>
            <AgentDetailPage />
          </AgentsAppShell>
        }
      />
      <Route
        path="/agents/:agentId/model-calls/:modelCallId"
        element={
          <AgentsAppShell>
            <ModelCallDetailPage />
          </AgentsAppShell>
        }
      />
      <Route path="/threads" element={<Navigate to="/developer/threads" replace />} />
      <Route path="/threads/:threadId" element={<RedirectToDeveloperThread />} />
      <Route path="/threads/:threadId/:orderId" element={<RedirectToDeveloperThread />} />
      <Route
        path="/tasks"
        element={
          <MainAppShell>
            <TasksPage />
          </MainAppShell>
        }
      />
      <Route
        path="/tasks/:boardId"
        element={
          <MainAppShell>
            <TaskBoardPage />
          </MainAppShell>
        }
      />
      <Route
        path="/metrics"
        element={
          <MetricsAppShell>
            <MetricsExplorerPage />
          </MetricsAppShell>
        }
      />
      <Route path="/metrics/pricing" element={<Navigate to="/metrics/pricing/overview" replace />} />
      <Route
        path="/metrics/pricing/overview"
        element={
          <MetricsAppShell>
            <PricingOverviewPage />
          </MetricsAppShell>
        }
      />
      <Route
        path="/metrics/pricing/explorer"
        element={
          <MetricsAppShell>
            <PricingExplorerPage />
          </MetricsAppShell>
        }
      />
      <Route
        path="/metrics/:metricName"
        element={
          <MetricsAppShell>
            <MetricDetailPage />
          </MetricsAppShell>
        }
      />
      <Route path="/configuration" element={<Navigate to="/configuration/integrations" replace />} />
      <Route
        path="/configuration/integrations"
        element={
          <ConfigurationAppShell>
            <IntegrationsPage />
          </ConfigurationAppShell>
        }
      />
      <Route
        path="/configuration/integrations/:integrationId"
        element={
          <ConfigurationAppShell>
            <IntegrationSettingsPage />
          </ConfigurationAppShell>
        }
      />
      <Route
        path="/configuration/inference-profiles"
        element={
          <ConfigurationAppShell>
            <InferenceProfilesPage />
          </ConfigurationAppShell>
        }
      />
      <Route
        path="/configuration/inference-profiles/:inferenceProfileId"
        element={
          <ConfigurationAppShell>
            <InferenceProfileSettingsPage />
          </ConfigurationAppShell>
        }
      />
      <Route
        path="/configuration/third-party-agents"
        element={
          <ConfigurationAppShell>
            <ThirdPartyAgentsPage />
          </ConfigurationAppShell>
        }
      />
      <Route
        path="/configuration/third-party-agents/:installId"
        element={
          <ConfigurationAppShell>
            <ThirdPartyAgentSettingsPage />
          </ConfigurationAppShell>
        }
      />
      <Route
        path="/configuration/agent-registries"
        element={
          <ConfigurationAppShell>
            <AgentRegistriesPage />
          </ConfigurationAppShell>
        }
      />
      <Route
        path="/configuration/agent-registries/:registryId"
        element={
          <ConfigurationAppShell>
            <AgentRegistrySettingsPage />
          </ConfigurationAppShell>
        }
      />
      <Route
        path="/configuration/repositories"
        element={
          <ConfigurationAppShell>
            <RepositoriesPage />
          </ConfigurationAppShell>
        }
      />
      <Route
        path="/configuration/repositories/:repositoryId"
        element={
          <ConfigurationAppShell>
            <RepositorySettingsPage />
          </ConfigurationAppShell>
        }
      />
      <Route path="/configuration/speech" element={<Navigate to="/configuration/voice" replace />} />
      <Route
        path="/configuration/voice"
        element={
          <ConfigurationAppShell>
            <VoiceSettingsPage />
          </ConfigurationAppShell>
        }
      />
      <Route
        path="/configuration/assistant"
        element={
          <ConfigurationAppShell>
            <AssistantSettingsPage />
          </ConfigurationAppShell>
        }
      />
      <Route
        path="/configuration/theme"
        element={
          <ConfigurationAppShell>
            <ThemeSettingsPage />
          </ConfigurationAppShell>
        }
      />
      <Route path="/developer" element={<Navigate to="/developer/daemon-logs" replace />} />
      <Route path="/developer/debug" element={<Navigate to="/developer/daemon-logs" replace />} />
      <Route path="/developer/debug/:logId" element={<Navigate to="/developer/daemon-logs" replace />} />
      <Route
        path="/developer/daemon-logs"
        element={
          <DeveloperAppShell>
            <DaemonLogsPage />
          </DeveloperAppShell>
        }
      />
      <Route
        path="/developer/daemon-logs/:logId"
        element={
          <DeveloperAppShell>
            <DaemonLogPage />
          </DeveloperAppShell>
        }
      />
      <Route
        path="/developer/database"
        element={
          <DeveloperAppShell>
            <DatabaseSettingsPage />
          </DeveloperAppShell>
        }
      />
      <Route
        path="/developer/threads"
        element={
          <DeveloperAppShell>
            <ThreadsPage />
          </DeveloperAppShell>
        }
      />
      <Route
        path="/developer/threads/:threadId"
        element={
          <DeveloperAppShell>
            <DeveloperThreadPage />
          </DeveloperAppShell>
        }
      />
      <Route
        path="/developer/threads/:threadId/:orderId"
        element={
          <DeveloperAppShell>
            <DeveloperThreadPage />
          </DeveloperAppShell>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function RedirectToDeveloperThread() {
  const params = useParams();
  const threadId = params.threadId ?? '';
  if (threadId.length === 0) {
    return <Navigate to="/developer/threads" replace />;
  }
  const base = `/developer/threads/${encodeURIComponent(threadId)}`;
  const target = params.orderId === undefined ? base : `${base}/${params.orderId}`;
  return <Navigate to={target} replace />;
}
