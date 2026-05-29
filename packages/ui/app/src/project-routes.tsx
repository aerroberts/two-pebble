import { Navigate, Route, Routes } from 'react-router-dom';
import { AgentsAppShell } from './layouts/agents-app-shell';
import { AutomationsAppShell } from './layouts/automations-app-shell';
import { DocumentsAppShell } from './layouts/documents-app-shell';
import { MainAppShell } from './layouts/main-app-shell';
import { AgentDetailPage } from './pages/agent-detail/agent-detail.page';
import { AgentsPage } from './pages/agents/agents.page';
import { AssistantPage } from './pages/assistant/assistant.page';
import { AutomationDetailPage } from './pages/automations/automation-detail/automation-detail.page';
import { AutomationsPage } from './pages/automations/automations.page';
import { AutomationsNewPage } from './pages/automations/automations-new.page';
import { DocumentEditorPage } from './pages/documents/document-editor.page';
import { DocumentsPage } from './pages/documents/documents.page';
import { ModelCallDetailPage } from './pages/model-call-detail/model-call-detail.page';
import { OverviewPage } from './pages/overview/overview.page';
import { SkillsPage } from './pages/skills/skills.page';
import { TaskBoardPage } from './pages/task-board/task-board.page';
import { TasksPage } from './pages/tasks/tasks.page';
import { ProjectProvider } from './project-context';
import { RedirectToDeveloperThread } from './redirect-to-developer-thread';

export function ProjectRoutes() {
  return (
    <ProjectProvider>
      <Routes>
        <Route
          path=""
          element={
            <MainAppShell>
              <OverviewPage />
            </MainAppShell>
          }
        />
        <Route
          path="assistant"
          element={
            <MainAppShell>
              <AssistantPage />
            </MainAppShell>
          }
        />
        <Route path="agents" element={<Navigate to="new" replace />} />
        <Route
          path="agents/new"
          element={
            <AgentsAppShell>
              <AgentsPage />
            </AgentsAppShell>
          }
        />
        <Route
          path="agents/:agentId"
          element={
            <AgentsAppShell>
              <AgentDetailPage />
            </AgentsAppShell>
          }
        />
        <Route
          path="agents/:agentId/model-calls/:modelCallId"
          element={
            <AgentsAppShell>
              <ModelCallDetailPage />
            </AgentsAppShell>
          }
        />
        <Route path="threads" element={<Navigate to="/developer/agents/thread-log" replace />} />
        <Route path="threads/:threadId" element={<RedirectToDeveloperThread />} />
        <Route path="threads/:threadId/:orderId" element={<RedirectToDeveloperThread />} />
        <Route
          path="tasks"
          element={
            <MainAppShell>
              <TasksPage />
            </MainAppShell>
          }
        />
        <Route
          path="tasks/:boardId"
          element={
            <MainAppShell>
              <TaskBoardPage />
            </MainAppShell>
          }
        />
        <Route
          path="documents"
          element={
            <DocumentsAppShell>
              <DocumentsPage />
            </DocumentsAppShell>
          }
        />
        <Route
          path="documents/:documentId"
          element={
            <DocumentsAppShell>
              <DocumentEditorPage />
            </DocumentsAppShell>
          }
        />
        <Route
          path="skills"
          element={
            <MainAppShell>
              <SkillsPage />
            </MainAppShell>
          }
        />
        <Route
          path="automations"
          element={
            <AutomationsAppShell>
              <AutomationsPage />
            </AutomationsAppShell>
          }
        />
        <Route
          path="automations/new"
          element={
            <AutomationsAppShell>
              <AutomationsNewPage />
            </AutomationsAppShell>
          }
        />
        <Route
          path="automations/:automationId"
          element={
            <AutomationsAppShell>
              <AutomationDetailPage />
            </AutomationsAppShell>
          }
        />
        <Route path="examples" element={<Navigate to="/examples" replace />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </ProjectProvider>
  );
}
