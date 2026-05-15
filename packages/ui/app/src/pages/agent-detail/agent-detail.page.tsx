import { Button, ChatPageLayout, Header, PageLayout, TabSelect } from '@two-pebble/components';
import { Navigate } from 'react-router-dom';
import { ConfirmDialog } from '../../shared/confirm/confirm-dialog';
import { useConfirm } from '../../shared/confirm/use-confirm';
import { AGENT_DETAIL_VIEW_OPTIONS } from './agent-detail.types';
import { AgentDetailChatViewBody } from './agent-detail-chat-view-body';
import { AgentDetailChatViewFooter } from './agent-detail-chat-view-footer';
import { AgentDetailPriceView } from './agent-detail-price-view';
import { AgentDetailTraceView } from './agent-detail-trace-view';
import { AgentDetailWaterfallView } from './agent-detail-waterfall-view';
import { useAgentDetailPageState } from './use-agent-detail-page-state';

export function AgentDetailPage() {
  const state = useAgentDetailPageState();
  const confirm = useConfirm();

  if (state.redirectToAgents) {
    return <Navigate to="/agents" replace />;
  }

  const requestFreshStart = async () => {
    const ok = await confirm.confirm({
      title: 'Fresh start',
      message:
        'Discard the agent’s saved session and start a new framework session under the same agent? The thread history stays attached, but the framework will not remember it directly.',
      confirmLabel: 'Fresh start',
    });
    if (ok) {
      await state.freshStartAgentRun();
    }
  };

  const showFreshStart = state.liveness?.state === 'reconnecting';

  const header = (
    <Header
      actionItems={
        <>
          {showFreshStart ? (
            <Button disabled={state.restarting} leftIcon="refresh-cw" onClick={() => void requestFreshStart()}>
              {state.restarting ? 'Restarting' : 'Fresh start'}
            </Button>
          ) : null}
          {state.agent?.parentAgentId ? (
            <Button leftIcon="ArrowLeft" onClick={() => state.openAgent(state.agent?.parentAgentId ?? '')}>
              Parent
            </Button>
          ) : null}
          <TabSelect options={AGENT_DETAIL_VIEW_OPTIONS} value={state.viewMode} onChange={state.setViewModeFromValue} />
        </>
      }
      subtitle={state.agent?.description ?? state.agentId}
    >
      {state.agent?.name ?? 'Agent'}
    </Header>
  );

  if (state.viewMode === 'chat') {
    return (
      <ChatPageLayout
        header={header}
        pinScrollToBottom
        footer={
          <>
            <AgentDetailChatViewFooter
              chatDraft={state.chatDraft}
              chatSending={state.chatSending}
              onChatDraftChange={state.setChatDraft}
              onChatSubmit={(override) => void state.sendChatMessage(override)}
            />
            <ConfirmDialog controller={confirm} />
          </>
        }
      >
        <AgentDetailChatViewBody
          agentLoaded={state.agent !== null}
          agentStatus={state.agent?.status ?? 'idle'}
          agentTraces={state.agentTraces}
          chatError={state.chatError}
          liveness={state.liveness}
          onAgentClick={state.openAgent}
          onModelCallClick={state.openModelCall}
          onStop={() => void state.stopAgentRun()}
          onTaskClick={state.openTask}
          onThreadSnapshotClick={state.openThreadSnapshot}
          onWorktreeOpenClick={state.openWorktree}
          stopping={state.stopping}
          traces={state.traces}
        />
      </ChatPageLayout>
    );
  }

  return (
    <PageLayout width="full">
      {header}
      {state.viewMode === 'trace' ? (
        <AgentDetailTraceView
          agentLoaded={state.agent !== null}
          agentTraces={state.agentTraces}
          onAgentClick={state.openAgent}
          onModelCallClick={state.openModelCall}
          onTaskClick={state.openTask}
          onThreadSnapshotClick={state.openThreadSnapshot}
          onWorktreeOpenClick={state.openWorktree}
          traces={state.traces}
        />
      ) : null}
      {state.viewMode === 'price' ? (
        <AgentDetailPriceView
          endTime={state.traceTimeRange?.endTime}
          lineItems={state.priceLineItems}
          loading={state.loadingPriceLineItems}
          startTime={state.traceTimeRange?.startTime}
        />
      ) : null}
      {state.viewMode === 'waterfall' ? (
        <AgentDetailWaterfallView
          items={state.waterfallItems}
          nowTimestamp={state.agent === null || state.agent.completedAt <= 0 ? Date.now() : state.agent.completedAt}
          onModelCallClick={state.openModelCall}
          onScopeChange={state.setWaterfallScope}
          scope={state.waterfallScope}
        />
      ) : null}
      <ConfirmDialog controller={confirm} />
    </PageLayout>
  );
}
