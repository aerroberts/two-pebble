import type { AgentRunningIndicatorProps, AgentRunningIndicatorStatus } from '@two-pebble/components';
import { AgentRunningIndicator, AgentTrace, Icon, Section, Status, Surface } from '@two-pebble/components';
import type { AgentTraceRecord, LoadableRegistry } from '@two-pebble/realtime';
import { useAppSettings } from '@two-pebble/realtime';
import { useMemo, useState } from 'react';
import { useSpeakText } from '../../shared/voice/use-speak-text';
import type { AgentQueuedMessageRecord } from './use-agent-detail-page-state';

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

interface AgentDetailChatViewBodyProps {
  agentLoaded: boolean;
  agentStatus: AgentRunningIndicatorStatus;
  traces: LoadableRegistry<AgentTraceRecord>;
  agentTraces: AgentTraceRecord[];
  chatError: string;
  liveness: AgentRunningIndicatorProps['liveness'];
  onAgentClick: (agentId: string) => void;
  onDocumentClick: (documentId: string) => void;
  onModelCallClick: (modelCallId: string) => void;
  onStop?: () => void;
  stopping?: boolean;
  onTaskClick: (boardId: string, taskId: string) => void;
  onThreadSnapshotClick: (threadCursor: string) => void;
  onWorktreeOpenClick: (worktreeId: string) => void;
  queuedMessages?: AgentQueuedMessageRecord[];
  waitingReasons?: string[];
}

/**
 * A foldable conversation section: opens on a user message, gathers
 * intermediate traces, and ends just before the next user message. When the
 * user toggles a section closed only the user prompt + the last assistant
 * reply in the section stay visible — every other trace hides behind a
 * "Show middle" affordance.
 */
interface ChatSection {
  key: string;
  traces: AgentTraceRecord[];
  /** Index into `traces` of the trailing assistant message, or `-1`. */
  finalAssistantIndex: number;
}

export function AgentDetailChatViewBody(props: AgentDetailChatViewBodyProps) {
  const chatTraces = useMemo(
    () => props.agentTraces.filter((trace) => !CHAT_HIDDEN_TRACE_TYPES.has(trace.type)),
    [props.agentTraces],
  );
  const speech = useSpeakText();
  const appSettings = useAppSettings();
  const foldingEnabled = appSettings.value?.chatConversationFoldingEnabled ?? false;
  const sections = useMemo(() => groupIntoSections(chatTraces), [chatTraces]);
  // Per-mount fold state. Defaults to "folded" iff the setting is on; users
  // can flip any section open or closed and the choice stays for as long as
  // they're on the page. Leaving the conversation drops the map.
  const [openOverrides, setOpenOverrides] = useState<Record<string, boolean>>({});

  const traceOptions = {
    onAgentClick: props.onAgentClick,
    onDocumentClick: props.onDocumentClick,
    onModelCallClick: props.onModelCallClick,
    onTaskClick: props.onTaskClick,
    onThreadSnapshotClick: props.onThreadSnapshotClick,
    onWorktreeOpenClick: props.onWorktreeOpenClick,
    speakController: speech.available ? speech : undefined,
  };

  return (
    <Section>
      {props.agentLoaded ? null : <Surface>Loading agent.</Surface>}
      {chatTraces.length === 0 ? (
        <Surface>{props.traces.status === 'loading' ? 'Loading events.' : 'No events.'}</Surface>
      ) : null}
      {chatTraces.length > 0
        ? sections.map((section, sectionIndex) => {
            const sectionMiddleLength = sectionMiddleSize(section);
            const isLastSection = sectionIndex === sections.length - 1;
            const foldable = isSectionFoldable(section, isLastSection);
            const folded = foldable && isFolded({ section, foldingEnabled, openOverrides, sectionMiddleLength });
            if (!folded || sectionMiddleLength === 0) {
              return <AgentTrace key={section.key} traces={section.traces} {...traceOptions} />;
            }
            // Folded: render user message + button + the final assistant reply.
            const userMsg = section.traces[0];
            const finalAssistant = section.traces[section.finalAssistantIndex];
            return (
              <div key={section.key} className="flex flex-col gap-2">
                <AgentTrace traces={[userMsg]} {...traceOptions} />
                <button
                  type="button"
                  className="group flex w-full items-center gap-3 px-6 py-2 text-xs text-content-muted transition-colors hover:text-content"
                  onClick={() => setOpenOverrides((prev) => ({ ...prev, [section.key]: true }))}
                  aria-expanded={false}
                  aria-label={`Show ${sectionMiddleLength} hidden steps`}
                >
                  <span className="h-px flex-1 bg-border" aria-hidden="true" />
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                    <Icon name="chevrons-down" color="text-current" />
                    <span>
                      Show {sectionMiddleLength} hidden {sectionMiddleLength === 1 ? 'step' : 'steps'}
                    </span>
                  </span>
                  <span className="h-px flex-1 bg-border" aria-hidden="true" />
                </button>
                {finalAssistant !== undefined ? <AgentTrace traces={[finalAssistant]} {...traceOptions} /> : null}
              </div>
            );
          })
        : null}
      <AgentRunningIndicator
        liveness={props.liveness}
        onStop={props.onStop}
        status={props.agentStatus}
        stopping={props.stopping}
        waitingReasons={props.waitingReasons}
      />
      {props.queuedMessages !== undefined && props.queuedMessages.length > 0 ? (
        <Surface>
          <div className="flex flex-col gap-3">
            {props.queuedMessages.map((message) => (
              <div key={message.id} className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0 flex-1 text-sm text-content">{renderQueuedMessageText(message)}</div>
                <Status
                  state={queuedMessageStatusToStatusState(message.status)}
                  variant="pill"
                  label={message.status}
                />
              </div>
            ))}
          </div>
        </Surface>
      ) : null}
      {props.chatError.length > 0 ? <Surface>{props.chatError}</Surface> : null}
    </Section>
  );
}

function queuedMessageStatusToStatusState(status: AgentQueuedMessageRecord['status']) {
  if (status === 'sent') {
    return 'success';
  }
  if (status === 'failed') {
    return 'failed';
  }
  return 'in-progress';
}

function renderQueuedMessageText(message: AgentQueuedMessageRecord) {
  const text = message.cells
    .map((cell) => {
      if (cell.type === 'text' || cell.type === 'header1' || cell.type === 'header2') {
        return cell.content.text;
      }
      if (cell.type === 'codeBlock') {
        return cell.content.code;
      }
      if (cell.type === 'data') {
        return JSON.stringify(cell.content.value);
      }
      if (cell.type === 'documentReference') {
        return cell.content.name;
      }
      if (cell.type === 'boardReference') {
        return cell.content.name;
      }
      return '';
    })
    .filter((value) => value.length > 0)
    .join('\n');
  return message.status === 'failed' && message.lastError !== null ? `${text}\n${message.lastError}` : text;
}

function groupIntoSections(traces: AgentTraceRecord[]): ChatSection[] {
  const sections: ChatSection[] = [];
  let current: AgentTraceRecord[] = [];
  let preamble: AgentTraceRecord[] = [];
  for (const trace of traces) {
    if (trace.type === 'user-message') {
      if (current.length > 0) {
        sections.push(finalizeSection(current, sections.length));
        current = [];
      } else if (preamble.length > 0) {
        sections.push(finalizeSection(preamble, sections.length));
        preamble = [];
      }
      current.push(trace);
      continue;
    }
    if (current.length === 0) {
      preamble.push(trace);
      continue;
    }
    current.push(trace);
  }
  if (current.length > 0) {
    sections.push(finalizeSection(current, sections.length));
  } else if (preamble.length > 0) {
    sections.push(finalizeSection(preamble, sections.length));
  }
  return sections;
}

function finalizeSection(traces: AgentTraceRecord[], index: number): ChatSection {
  let finalAssistantIndex = -1;
  for (let i = traces.length - 1; i >= 0; i -= 1) {
    const trace = traces[i];
    if (trace !== undefined && trace.type === 'assistant-message') {
      finalAssistantIndex = i;
      break;
    }
  }
  const key = traces[0]?.id ?? `chat-section-${index}`;
  return { key, traces, finalAssistantIndex };
}

/**
 * A section's assistant turn is foldable only when it sits between two user
 * messages: the section must start with a user message AND another section
 * (which always starts with a user message) must follow it. The most recent
 * turn — the last section in the list — is never foldable because its turn
 * is still "open" and no user message has come after it yet. Sections that
 * lack a leading user message (such as a preamble before the first user
 * message) are likewise not foldable.
 */
function isSectionFoldable(section: ChatSection, isLastSection: boolean): boolean {
  if (isLastSection) {
    return false;
  }
  return section.traces[0]?.type === 'user-message';
}

/**
 * Number of traces the fold would hide. Excludes the leading user message
 * and the trailing assistant message that stay visible.
 */
function sectionMiddleSize(section: ChatSection): number {
  if (section.traces.length === 0) {
    return 0;
  }
  const head = section.traces[0]?.type === 'user-message' ? 1 : 0;
  const tail = section.finalAssistantIndex >= head ? 1 : 0;
  return Math.max(0, section.traces.length - head - tail);
}

function isFolded(input: {
  section: ChatSection;
  foldingEnabled: boolean;
  openOverrides: Record<string, boolean>;
  sectionMiddleLength: number;
}): boolean {
  if (input.sectionMiddleLength === 0) {
    return false;
  }
  const override = input.openOverrides[input.section.key];
  if (override === true) {
    return false;
  }
  if (override === false) {
    return true;
  }
  return input.foldingEnabled;
}
