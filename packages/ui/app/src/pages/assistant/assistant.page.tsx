import {
  AgentRunningIndicator,
  AgentTrace,
  Button,
  ChatPageLayout,
  Header,
  InputArea,
  PageLayout,
  Row,
  Section,
  Surface,
  TabSelect,
} from '@two-pebble/components';
import { useMemo, useRef, useState } from 'react';
import { ConfirmDialog } from '../../shared/confirm/confirm-dialog';
import { useConfirm } from '../../shared/confirm/use-confirm';
import { useSpeakText } from '../../shared/voice/use-speak-text';
import type { VoiceCaptureStatus } from '../../shared/voice/use-voice-capture';
import { VoiceCaptureButton } from '../../shared/voice/voice-capture-button';
import { useAssistantPageState } from './use-assistant-page-state';

const CHAT_HIDDEN_TRACE_TYPES = new Set<string>([
  'system-message',
  'worktree-initialized',
  'turn-start',
  'conversation-thread-snapshot',
  'state-snapshot',
  'model-call-start',
  'model-call-success',
  'model-call-failure',
  'capability-register',
  'capability-deregister',
]);

type AssistantViewMode = 'direct' | 'chat';

const ASSISTANT_VIEW_OPTIONS = [
  { value: 'direct', label: 'Direct', icon: 'mic' },
  { value: 'chat', label: 'Chat', icon: 'message-square' },
];

export function AssistantPage() {
  const state = useAssistantPageState();
  const confirm = useConfirm();
  const speech = useSpeakText();
  // Anchor that wipes Direct-view trace history on tab navigation. Traces with
  // orderId at or above the anchor are considered part of the current turn
  // window; anything earlier is treated as prior history and hidden in Direct
  // view.
  const [directTurnAnchor, setDirectTurnAnchor] = useState<number>(() => Number.POSITIVE_INFINITY);
  const [viewMode, setViewMode] = useState<AssistantViewMode>('direct');
  const [voiceStatus, setVoiceStatus] = useState<VoiceCaptureStatus>('idle');
  const isRecording = voiceStatus === 'recording';
  // Track the agent we anchored against so a context reset re-anchors fresh.
  const anchoredAgentIdRef = useRef<string | null>(null);

  const sendDisabled = state.chatSending || state.chatDraft.trim().length === 0 || state.registryId === null;
  const chatTraces = useMemo(
    () => state.agentTraces.filter((trace) => !CHAT_HIDDEN_TRACE_TYPES.has(trace.type)),
    [state.agentTraces],
  );
  const agentStatus = state.agent?.status ?? 'idle';

  // If the agent identity changes (context reset or first load), open the
  // Direct-view window so new turns are visible from the start.
  if (anchoredAgentIdRef.current !== state.agentId) {
    anchoredAgentIdRef.current = state.agentId;
    if (directTurnAnchor !== 0) {
      setDirectTurnAnchor(0);
    }
  }

  const directTraces = useMemo(() => {
    if (!Number.isFinite(directTurnAnchor)) {
      return [] as typeof chatTraces;
    }
    // Find the most-recent user-message at or after the anchor — that is the
    // start of the current turn. If none exists yet, the turn has not started
    // and we render nothing.
    const turnStartIndex = findLastUserMessageIndex(chatTraces, directTurnAnchor);
    if (turnStartIndex === -1) {
      return [] as typeof chatTraces;
    }
    return chatTraces.slice(turnStartIndex);
  }, [chatTraces, directTurnAnchor]);

  const handleViewModeChange = (value: string) => {
    const nextMode: AssistantViewMode = value === 'chat' ? 'chat' : 'direct';
    if (nextMode === viewMode) {
      return;
    }
    if (nextMode === 'direct') {
      // Wipe trace state on tab navigation: only traces with orderIds beyond
      // the current latest will be eligible for the Direct turn window.
      const latest = state.agentTraces[state.agentTraces.length - 1];
      setDirectTurnAnchor(latest ? latest.orderId + 1 : 0);
    }
    setViewMode(nextMode);
  };

  const requestReset = async () => {
    const ok = await confirm.confirm({
      title: 'Reset Assistant context',
      message:
        'Provision a fresh Assistant agent on the next message? The previous agent stays in your agent list and can be reopened from there.',
      confirmLabel: 'Reset',
    });
    if (ok) {
      state.resetContext();
      setDirectTurnAnchor(0);
    }
  };

  if (state.settingsLoaded && state.registryId === null) {
    return (
      <PageLayout width="fixed">
        <Header subtitle="Pick the agent that powers the Assistant.">Assistant</Header>
        <Section>
          <Surface>
            Select an agent under Settings → Configuration → Assistant before sending a message. The Assistant reuses
            that agent across visits.
          </Surface>
        </Section>
      </PageLayout>
    );
  }

  const tabs = <TabSelect options={ASSISTANT_VIEW_OPTIONS} value={viewMode} onChange={handleViewModeChange} />;

  const resetControl =
    state.agentId === null ? null : (
      <Button leftIcon="refresh-cw" onClick={() => void requestReset()}>
        Reset context
      </Button>
    );

  const inputArea = (
    <InputArea
      aria-label="Assistant message"
      disabled={state.chatSending || isRecording}
      onChange={(event) => state.setChatDraft(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          if (!sendDisabled) {
            void state.sendChatMessage();
          }
        }
      }}
      placeholder="Talk to your Assistant — Enter to send, Shift+Enter for newline"
      value={state.chatDraft}
    />
  );

  const inputControls = (
    <div
      className={`flex transition-[justify-content] duration-200 ease-out ${
        isRecording ? 'justify-center' : 'justify-start'
      }`}
    >
      <Row gap="sm">
        <VoiceCaptureButton
          onStatusChange={setVoiceStatus}
          onTranscript={(text) => state.setChatDraft(joinTranscript(state.chatDraft, text))}
          onSubmitTranscript={(text) => {
            const next = joinTranscript(state.chatDraft, text);
            state.setChatDraft(next);
            if (next.trim().length > 0 && state.registryId !== null && !state.chatSending) {
              void state.sendChatMessage(next);
            }
          }}
        />
        {resetControl}
      </Row>
    </div>
  );

  const header = (
    <Header actionItems={tabs} subtitle="Talk to your saved Assistant agent. The conversation persists across visits.">
      Assistant
    </Header>
  );

  if (viewMode === 'direct') {
    return (
      <ChatPageLayout
        header={header}
        footer={
          <>
            {inputArea}
            {inputControls}
            <ConfirmDialog controller={confirm} />
          </>
        }
        width="fixed"
      >
        <Section>
          {state.agentId === null ? (
            <Surface>Send a message below to start a new Assistant session.</Surface>
          ) : directTraces.length === 0 ? (
            <Surface>
              {state.traces.status === 'loading' ? 'Loading events.' : 'Send a message to start a new turn.'}
            </Surface>
          ) : (
            <AgentTrace
              onAgentClick={() => undefined}
              onModelCallClick={() => undefined}
              speakController={speech.available ? speech : undefined}
              onTaskClick={() => undefined}
              onThreadSnapshotClick={() => undefined}
              onWorktreeOpenClick={() => undefined}
              traces={directTraces}
            />
          )}
          {state.agentId !== null ? <AgentRunningIndicator status={agentStatus} liveness={state.liveness} /> : null}
          {state.chatError.length > 0 ? <Surface>{state.chatError}</Surface> : null}
        </Section>
      </ChatPageLayout>
    );
  }

  return (
    <ChatPageLayout
      header={header}
      footer={
        <>
          {inputArea}
          {inputControls}
          <ConfirmDialog controller={confirm} />
        </>
      }
    >
      <Section>
        {state.agentId === null ? (
          <Surface>Send a message below to start a new Assistant session.</Surface>
        ) : chatTraces.length === 0 ? (
          <Surface>{state.traces.status === 'loading' ? 'Loading events.' : 'No events yet.'}</Surface>
        ) : (
          <AgentTrace
            onAgentClick={() => undefined}
            onModelCallClick={() => undefined}
            speakController={speech.available ? speech : undefined}
            onTaskClick={() => undefined}
            onThreadSnapshotClick={() => undefined}
            onWorktreeOpenClick={() => undefined}
            traces={chatTraces}
          />
        )}
        {state.agentId !== null ? <AgentRunningIndicator status={agentStatus} liveness={state.liveness} /> : null}
        {state.chatError.length > 0 ? <Surface>{state.chatError}</Surface> : null}
      </Section>
    </ChatPageLayout>
  );
}

function joinTranscript(existing: string, transcript: string): string {
  if (transcript.length === 0) {
    return existing;
  }
  if (existing.length === 0) {
    return transcript;
  }
  return existing.endsWith(' ') ? `${existing}${transcript}` : `${existing} ${transcript}`;
}

function findLastUserMessageIndex<T extends { type: string; orderId: number }>(
  traces: T[],
  minOrderId: number,
): number {
  for (let index = traces.length - 1; index >= 0; index -= 1) {
    const trace = traces[index];
    if (trace === undefined) {
      continue;
    }
    if (trace.type === 'user-message' && trace.orderId >= minOrderId) {
      return index;
    }
  }
  return -1;
}
