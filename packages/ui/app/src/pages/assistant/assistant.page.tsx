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
} from '@two-pebble/components';
import { ConfirmDialog } from '../../shared/confirm/confirm-dialog';
import { useConfirm } from '../../shared/confirm/use-confirm';
import { useSpeakText } from '../../shared/voice/use-speak-text';
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

export function AssistantPage() {
  const state = useAssistantPageState();
  const confirm = useConfirm();
  const speech = useSpeakText();
  const sendDisabled = state.chatSending || state.chatDraft.trim().length === 0 || state.registryId === null;
  const chatTraces = state.agentTraces.filter((trace) => !CHAT_HIDDEN_TRACE_TYPES.has(trace.type));
  const agentStatus = state.agent?.status ?? 'idle';

  const requestReset = async () => {
    const ok = await confirm.confirm({
      title: 'Reset Assistant context',
      message:
        'Provision a fresh Assistant agent on the next message? The previous agent stays in your agent list and can be reopened from there.',
      confirmLabel: 'Reset',
    });
    if (ok) {
      state.resetContext();
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

  return (
    <ChatPageLayout
      header={
        <Header
          actionItems={
            state.agentId === null ? null : (
              <Button leftIcon="refresh-cw" onClick={() => void requestReset()}>
                Reset context
              </Button>
            )
          }
          subtitle="Talk to your saved Assistant agent. The conversation persists across visits."
        >
          Assistant
        </Header>
      }
      footer={
        <>
          <InputArea
            aria-label="Assistant message"
            disabled={state.chatSending}
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
          <Row gap="sm">
            <VoiceCaptureButton
              onTranscript={(text) => state.setChatDraft(joinTranscript(state.chatDraft, text))}
              onSubmitTranscript={(text) => {
                const next = joinTranscript(state.chatDraft, text);
                state.setChatDraft(next);
                if (next.trim().length > 0 && state.registryId !== null && !state.chatSending) {
                  void state.sendChatMessage(next);
                }
              }}
            />
          </Row>
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
