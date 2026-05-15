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
import { useMemo, useState } from 'react';
import { ConfirmDialog } from '../../shared/confirm/confirm-dialog';
import { useConfirm } from '../../shared/confirm/use-confirm';
import { useSpeakText } from '../../shared/voice/use-speak-text';
import type { VoiceCaptureStatus } from '../../shared/voice/use-voice-capture';
import { VoiceCaptureButton } from '../../shared/voice/voice-capture-button';
import { AssistantDirectInputControl } from './assistant-direct-input';
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

/**
 * Assistant page.
 *
 * # Direct view contract
 *
 * The Direct view has two visual layouts driven by a single boolean,
 * `hasSubmittedThisVisit`:
 *
 *   - Initial (hero): the dual-mode input cluster is vertically centered
 *     in the view, with large primary-color voice + text buttons. No
 *     trace history is shown — a fresh visit always lands on an empty
 *     surface inviting the user to start a turn.
 *   - Post-submit (compact): the cluster animates down to the bottom of
 *     the page (chat-style composer), shrunk to compact size, and the
 *     traces stream fills the area above it. State stays this way for
 *     the remainder of this visit; navigating away and back to the
 *     Assistant page snaps it back to hero + cleared history.
 *
 * The transition between the two layouts is a smooth flex-grow animation
 * on a bottom spacer (1 → 0) so the cluster appears to slide downward.
 *
 * # Latest-turn windowing
 *
 * On every mount (= every visit) the `directTurnAnchor` is set to "one
 * past the latest existing trace orderId" so previously-recorded turns
 * stay hidden. After the user sends, new traces arrive with orderIds
 * past the anchor and `findLastUserMessageIndex` slices the visible list
 * to the latest user-message onward. The Chat tab still owns the full
 * conversation history; Direct is intentionally single-turn.
 *
 * The Chat view keeps its existing footer-anchored InputArea + voice
 * button row; only Direct uses the dual-mode hero ↔ compact layout.
 */
export function AssistantPage() {
  const state = useAssistantPageState();
  const confirm = useConfirm();
  const speech = useSpeakText();
  // Anchor that hides everything older than this visit. The Direct view
  // only shows traces whose orderId is past the anchor — anything older is
  // prior history and stays invisible until the user navigates to Chat.
  const [directTurnAnchor, setDirectTurnAnchor] = useState<number>(() => Number.POSITIVE_INFINITY);
  // Flips true on the first send of this visit and stays true. Drives the
  // hero (centered) ↔ compact (bottom) layout transition.
  const [hasSubmittedThisVisit, setHasSubmittedThisVisit] = useState(false);
  const [viewMode, setViewMode] = useState<AssistantViewMode>('direct');
  const [voiceStatus, setVoiceStatus] = useState<VoiceCaptureStatus>('idle');
  const isRecording = voiceStatus === 'recording';
  const sendDisabled = state.chatSending || state.chatDraft.trim().length === 0 || state.registryId === null;
  const chatTraces = useMemo(
    () => state.agentTraces.filter((trace) => !CHAT_HIDDEN_TRACE_TYPES.has(trace.type)),
    [state.agentTraces],
  );
  const agentStatus = state.agent?.status ?? 'idle';

  /**
   * Anchor is captured AT SEND TIME so it always sees a fully-loaded trace
   * list. Anchoring at mount loses the race against the realtime trace
   * subscription — `agentTraces` starts empty before the realtime layer has
   * replied with the agent's history, so anchoring there clamps to 0 and
   * the previous turn leaks into view. Capturing at send guarantees the
   * snapshot is current.
   */
  const sendDirectMessage = async (override?: string) => {
    const latest = state.agentTraces[state.agentTraces.length - 1];
    setDirectTurnAnchor(latest === undefined ? 0 : latest.orderId + 1);
    setHasSubmittedThisVisit(true);
    await state.sendChatMessage(override);
  };

  const directTraces = useMemo(() => {
    if (!Number.isFinite(directTurnAnchor)) {
      return [] as typeof chatTraces;
    }
    // Latest user-message at or after the anchor is the start of the
    // current turn. If none exists, the turn has not started and we render
    // nothing.
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
      // Wipe trace state on tab navigation: only traces with orderIds
      // beyond the current latest will be eligible for the Direct turn
      // window.
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
      setHasSubmittedThisVisit(false);
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

  const header = (
    <Header actionItems={tabs} subtitle="Talk to your saved Assistant agent. The conversation persists across visits.">
      Assistant
    </Header>
  );

  if (viewMode === 'direct') {
    return (
      <ChatPageLayout footer={<ConfirmDialog controller={confirm} />} header={header} width="fixed">
        <div className="flex h-full min-h-0 flex-col">
          {/* Upper region: traces aligned to the bottom edge so the latest
              content sits right above the input cluster. Flex-1 so it
              consumes available space. */}
          <div className="flex min-h-0 flex-1 flex-col justify-end overflow-y-auto pb-6">
            {state.agentId !== null && directTraces.length > 0 ? (
              <AgentTrace
                onAgentClick={() => undefined}
                onModelCallClick={() => undefined}
                onTaskClick={() => undefined}
                onThreadSnapshotClick={() => undefined}
                onWorktreeOpenClick={() => undefined}
                speakController={speech.available ? speech : undefined}
                traces={directTraces}
              />
            ) : null}
            {state.agentId !== null && hasSubmittedThisVisit ? (
              <div className="pt-2">
                <AgentRunningIndicator liveness={state.liveness} status={agentStatus} />
              </div>
            ) : null}
            {state.chatError.length > 0 ? (
              <div className="pt-2">
                <Surface>{state.chatError}</Surface>
              </div>
            ) : null}
          </div>

          {/* Input cluster — wrapped in a flex-shrink-0 row that always sits
              just above the bottom spacer. The cluster itself is hero-sized
              (large primary buttons centered) until the first submit; then
              the bottom spacer's flex-grow animates from 1 → 0, sliding
              the cluster down to the page bottom for the rest of the visit.
              The cluster also shrinks to compact size in the same beat. */}
          <div className="flex shrink-0 justify-center px-4 py-2">
            <div className="w-full max-w-xl">
              <AssistantDirectInputControl
                chatDraft={state.chatDraft}
                chatSending={state.chatSending}
                onVoiceStatusChange={setVoiceStatus}
                registryId={state.registryId}
                sendChatMessage={sendDirectMessage}
                setChatDraft={state.setChatDraft}
              />
              {resetControl !== null ? (
                <div className="mt-3 flex justify-center">
                  <Row gap="sm">{resetControl}</Row>
                </div>
              ) : null}
            </div>
          </div>

          {/* Bottom spacer — animates from flex-grow 1 (cluster centered)
              to flex-grow 0 (cluster at bottom) over 450ms on first submit.
              flex-grow is a continuously animatable value in modern
              browsers, so the slide reads as a smooth slide-down. */}
          <div
            aria-hidden="true"
            className="shrink-0 transition-[flex-grow] duration-500 ease-in-out"
            style={{ flexGrow: hasSubmittedThisVisit ? 0 : 1 }}
          />
        </div>
      </ChatPageLayout>
    );
  }

  const chatInputArea = (
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

  const chatInputControls = (
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

  return (
    <ChatPageLayout
      header={header}
      footer={
        <>
          {chatInputArea}
          {chatInputControls}
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
