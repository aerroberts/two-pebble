import { Navigate, Route, Routes } from 'react-router-dom';
import { DeveloperAppShell } from './layouts/developer-app-shell';
import { DeveloperAgentSignalsPage } from './pages/developer/agents/developer-agent-signals.page';
import { DeveloperAgentsPage } from './pages/developer/agents/developer-agents.page';
import { DaemonLogPage } from './pages/developer/daemon-logs/daemon-log.page';
import { DaemonLogsPage } from './pages/developer/daemon-logs/daemon-logs.page';
import { DatabaseSettingsPage } from './pages/developer/database/database-settings.page';
import { HeartbeatsPage } from './pages/developer/heartbeats/heartbeats.page';
import { DeveloperThreadPage } from './pages/developer/threads/developer-thread-page';
import { ThreadsPage } from './pages/developer/threads/threads.page';
import { RedirectToDeveloperThread } from './redirect-to-developer-thread';

export function DeveloperRoutes() {
  return (
    <Routes>
      <Route path="" element={<Navigate to="/developer/daemon-logs" replace />} />
      <Route path="debug" element={<Navigate to="/developer/daemon-logs" replace />} />
      <Route path="debug/:logId" element={<Navigate to="/developer/daemon-logs" replace />} />
      <Route path="threads" element={<Navigate to="/developer/agents/thread-log" replace />} />
      <Route path="threads/:threadId" element={<RedirectToDeveloperThread />} />
      <Route path="threads/:threadId/:orderId" element={<RedirectToDeveloperThread />} />
      <Route
        path="daemon-logs"
        element={
          <DeveloperAppShell>
            <DaemonLogsPage />
          </DeveloperAppShell>
        }
      />
      <Route
        path="daemon-logs/:logId"
        element={
          <DeveloperAppShell>
            <DaemonLogPage />
          </DeveloperAppShell>
        }
      />
      <Route
        path="database"
        element={
          <DeveloperAppShell>
            <DatabaseSettingsPage />
          </DeveloperAppShell>
        }
      />
      <Route
        path="heartbeats"
        element={
          <DeveloperAppShell>
            <HeartbeatsPage />
          </DeveloperAppShell>
        }
      />
      <Route
        path="agents"
        element={
          <DeveloperAppShell>
            <DeveloperAgentsPage />
          </DeveloperAppShell>
        }
      />
      <Route
        path="agents/signals"
        element={
          <DeveloperAppShell>
            <DeveloperAgentSignalsPage />
          </DeveloperAppShell>
        }
      />
      <Route
        path="agents/thread-log"
        element={
          <DeveloperAppShell>
            <ThreadsPage />
          </DeveloperAppShell>
        }
      />
      <Route
        path="agents/thread-log/:threadId"
        element={
          <DeveloperAppShell>
            <DeveloperThreadPage />
          </DeveloperAppShell>
        }
      />
      <Route
        path="agents/thread-log/:threadId/:orderId"
        element={
          <DeveloperAppShell>
            <DeveloperThreadPage />
          </DeveloperAppShell>
        }
      />
    </Routes>
  );
}
