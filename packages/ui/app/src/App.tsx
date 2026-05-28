import { LoadingPage, NotConnectedPage } from '@two-pebble/components';
import { useRealtimeConnection } from '@two-pebble/realtime';
import { useEffect } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { DeveloperRoutes } from './developer-routes';
import { AssistantCommandK } from './layouts/assistant-command-k';
import { ConfigurationAppShell } from './layouts/configuration-app-shell';
import { ExamplesAppShell } from './layouts/examples-app-shell';
import { MetricsAppShell } from './layouts/metrics-app-shell';
import { AgentRegistriesPage } from './pages/configuration/agent-registries/agent-registries.page';
import { AgentRegistrySettingsPage } from './pages/configuration/agent-registries/agent-registry-settings.page';
import { AssistantSettingsPage } from './pages/configuration/assistant/assistant-settings.page';
import { IdeSettingsPage } from './pages/configuration/ide/ide-settings.page';
import { InferenceProfileSettingsPage } from './pages/configuration/inference-profiles/inference-profile-settings.page';
import { InferenceProfilesPage } from './pages/configuration/inference-profiles/inference-profiles.page';
import { IntegrationSettingsPage } from './pages/configuration/integrations/integration-settings.page';
import { IntegrationsPage } from './pages/configuration/integrations/integrations.page';
import { ProjectSettingsPage } from './pages/configuration/projects/project-settings.page';
import { ProjectsPage } from './pages/configuration/projects/projects.page';
import { RepositoriesPage } from './pages/configuration/repositories/repositories.page';
import { RepositorySettingsPage } from './pages/configuration/repositories/repository-settings.page';
import { ThemeSettingsPage } from './pages/configuration/theme/theme-settings.page';
import { ThirdPartyAgentSettingsPage } from './pages/configuration/third-party-agents/third-party-agent-settings.page';
import { ThirdPartyAgentsPage } from './pages/configuration/third-party-agents/third-party-agents.page';
import { VoiceSettingsPage } from './pages/configuration/voice/voice-settings.page';
import { ExamplesPage } from './pages/examples/examples.page';
import { MetricDetailPage } from './pages/metrics/metric-detail.page';
import { MetricsExplorerPage } from './pages/metrics/metrics-explorer.page';
import { PricingExplorerPage } from './pages/metrics/pricing-explorer.page';
import { PricingOverviewPage } from './pages/metrics/pricing-overview.page';
import { ProjectPickerPage } from './pages/projects/project-picker.page';
import { projectPath, readLastViewedProjectId } from './project-context';
import { ProjectRoutes } from './project-routes';

export function App() {
  const connection = useRealtimeConnection();
  useInternalLinkInterception();

  if (connection.status === 'connecting') {
    return <LoadingPage />;
  }

  if (connection.status === 'not-connected') {
    return <NotConnectedPage />;
  }

  return (
    <>
      <AssistantCommandK />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/projects" element={<ProjectPickerPage />} />
        <Route path="/project/:projectId/*" element={<ProjectRoutes />} />
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
          path="/configuration/projects"
          element={
            <ConfigurationAppShell>
              <ProjectsPage />
            </ConfigurationAppShell>
          }
        />
        <Route
          path="/configuration/projects/:projectId"
          element={
            <ConfigurationAppShell>
              <ProjectSettingsPage />
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
          path="/configuration/ide"
          element={
            <ConfigurationAppShell>
              <IdeSettingsPage />
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
        <Route
          path="/examples/:pageId?"
          element={
            <ExamplesAppShell>
              <ExamplesPage />
            </ExamplesAppShell>
          }
        />
        <Route path="/developer/*" element={<DeveloperRoutes />} />
        <Route path="*" element={<Navigate to="/projects" replace />} />
      </Routes>
    </>
  );
}

function RootRedirect() {
  const lastViewedProjectId = readLastViewedProjectId();
  return <Navigate to={lastViewedProjectId === null ? '/projects' : projectPath(lastViewedProjectId, '/')} replace />;
}

/**
 * Intercepts clicks on anchor tags with same-origin hrefs and routes them
 * through react-router so embedded pills (and any future internal links
 * rendered by the shared components package) navigate without a reload.
 */
function useInternalLinkInterception() {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (event.defaultPrevented) {
        return;
      }
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      const anchor = target.closest('a');
      if (anchor === null) {
        return;
      }
      const href = anchor.getAttribute('href');
      if (href === null || href.length === 0) {
        return;
      }
      if (anchor.target === '_blank' || anchor.hasAttribute('download')) {
        return;
      }
      if (!href.startsWith('/') || href.startsWith('//')) {
        return;
      }
      event.preventDefault();
      navigate(href);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [navigate]);
}
