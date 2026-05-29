import type { CellContent, ConversationThreadCell, DataCells } from '@two-pebble/pebble';
import { useState } from 'react';
import { MarkdownView } from '../../code/markdown/markdown';
import { Header } from '../../content/header/header';
import { Section } from '../../content/section/section';
import { Button } from '../../input/button/button';
import { ButtonGroup } from '../../input/button-group/button-group';
import { PageLayout } from '../../layout/page-layout/page-layout';

export type ThreadSnapshotLoadStatus = 'idle' | 'loading' | 'ready' | 'error';
type ThreadSnapshotViewMode = 'markdown' | 'annotated' | 'raw';

const THREAD_SNAPSHOT_VIEW_OPTIONS = [
  { value: 'markdown', label: 'Markdown' },
  { value: 'annotated', label: 'Annotated' },
  { value: 'raw', label: 'Raw' },
];

export interface ThreadSnapshotCell {
  orderId: number;
  content: DataCells;
  id: string;
  label: string;
  role: ConversationThreadCell['role'];
}

export interface ThreadSnapshotPageProps {
  orderId: number | null;
  cells: ThreadSnapshotCell[];
  onViewFullThread: () => void;
  status: ThreadSnapshotLoadStatus;
}

export function ThreadSnapshotPage(props: ThreadSnapshotPageProps) {
  const viewingSnapshot = props.orderId !== null;
  const [viewMode, setViewMode] = useState<ThreadSnapshotViewMode>('markdown');

  return (
    <PageLayout width="fixed">
      <Header
        actionItems={
          <ButtonGroup
            options={THREAD_SNAPSHOT_VIEW_OPTIONS}
            value={viewMode}
            onChange={(value) => setViewMode(parseThreadSnapshotViewMode(value))}
          />
        }
      >
        {viewingSnapshot ? 'Thread Snapshot' : 'Thread'}
      </Header>
      <Section>
        {props.status === 'loading' ? <div className="rounded-md bg-surface p-4">Loading thread snapshot.</div> : null}
        {props.status === 'error' ? (
          <div className="rounded-md bg-surface p-4">Could not load thread snapshot.</div>
        ) : null}
        {props.status === 'ready' && props.cells.length === 0 ? (
          <div className="rounded-md bg-surface p-4">No conversation cells found for this snapshot.</div>
        ) : null}
        {props.cells.length > 0 ? <ThreadSnapshotContent cells={props.cells} mode={viewMode} /> : null}
      </Section>
      {viewingSnapshot ? (
        <Section title="Snapshot">
          <div className="rounded-md bg-surface p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm leading-6 text-content-muted">Viewing a point in time snapshot.</p>
              <Button rightIcon="arrow-right" onClick={props.onViewFullThread}>
                View full thread
              </Button>
            </div>
          </div>
        </Section>
      ) : null}
    </PageLayout>
  );
}

function ThreadSnapshotContent(props: { cells: ThreadSnapshotCell[]; mode: ThreadSnapshotViewMode }) {
  switch (props.mode) {
    case 'annotated':
      return <AnnotatedThreadCellList cells={props.cells} />;
    case 'raw':
      return <RawThreadTurns cells={props.cells} />;
    case 'markdown':
      return <MarkdownThreadTurns cells={props.cells} />;
  }
}

function MarkdownThreadTurns(props: { cells: ThreadSnapshotCell[] }) {
  return (
    <div className="flex flex-col gap-4">
      {groupThreadTurns(props.cells).map((turn) => (
        <div key={turn.firstCellId} className="flex flex-col gap-3">
          <MarkdownThreadTurnSeparator role={turn.role} />
          <MarkdownView content={turn.raw} />
        </div>
      ))}
    </div>
  );
}

function RawThreadTurns(props: { cells: ThreadSnapshotCell[] }) {
  return (
    <div className="flex flex-col gap-4">
      {groupThreadTurns(props.cells).map((turn) => (
        <div key={turn.firstCellId} className="flex flex-col gap-2">
          <ThreadTurnSeparator role={turn.role} />
          <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-5 text-content">{turn.raw}</pre>
        </div>
      ))}
    </div>
  );
}

function ThreadTurnSeparator(props: { role: ConversationThreadCell['role'] }) {
  return (
    <div className="flex items-center gap-2">
      <hr className="min-w-0 flex-1 border-border" />
      <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-content-muted">
        {formatThreadCellRole(props.role)} turn
      </span>
      <hr className="min-w-0 flex-1 border-border" />
    </div>
  );
}

function MarkdownThreadTurnSeparator(props: { role: ConversationThreadCell['role'] }) {
  return (
    <div className="flex items-center gap-2 py-3">
      <span
        className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide ${getThreadTurnPillClassName(
          props.role,
        )}`}
      >
        {formatThreadCellRole(props.role)} turn
      </span>
      <hr className="min-w-0 flex-1 border-border" />
    </div>
  );
}

function AnnotatedThreadCellList(props: { cells: ThreadSnapshotCell[] }) {
  return (
    <div className="flex flex-col gap-2">
      {props.cells.map((cell) => (
        <div key={cell.id} className={`rounded-md px-3 py-2 ${getThreadCellBackgroundClassName(cell.role)}`}>
          <div className="mb-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wide text-content-muted">
            <span>{formatThreadCellLabel(cell)}</span>
          </div>
          <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-5 text-content">
            {serializeCellContentList(cell.content)}
          </pre>
        </div>
      ))}
    </div>
  );
}

function formatThreadCellRole(role: ConversationThreadCell['role']) {
  return role === 'cache' ? 'system' : role;
}

function formatThreadCellLabel(cell: ThreadSnapshotCell) {
  return cell.label.trim() || `${formatThreadCellRole(cell.role)} turn`;
}

interface ThreadTurn {
  firstCellId: string;
  raw: string;
  role: ConversationThreadCell['role'];
}

function groupThreadTurns(cells: readonly ThreadSnapshotCell[]) {
  const turns: ThreadTurn[] = [];

  for (const cell of cells) {
    const currentTurn = turns.at(-1);
    const raw = serializeCellContentList(cell.content);

    if (currentTurn === undefined || currentTurn.role !== cell.role) {
      turns.push({ firstCellId: cell.id, raw, role: cell.role });
      continue;
    }

    currentTurn.raw = [currentTurn.raw, raw].filter((value) => value.length > 0).join('\n\n');
  }

  return turns;
}

function parseThreadSnapshotViewMode(value: string): ThreadSnapshotViewMode {
  if (value === 'annotated' || value === 'raw') {
    return value;
  }

  return 'markdown';
}

function getThreadCellBackgroundClassName(role: ConversationThreadCell['role']) {
  switch (role) {
    case 'assistant':
      return 'bg-emerald-500/10';
    case 'cache':
    case 'system':
      return 'bg-amber-500/10';
    case 'user':
      return 'bg-sky-500/10';
  }
}

function getThreadTurnPillClassName(role: ConversationThreadCell['role']) {
  switch (role) {
    case 'assistant':
      return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300';
    case 'cache':
    case 'system':
      return 'bg-amber-500/15 text-amber-700 dark:text-amber-300';
    case 'user':
      return 'bg-sky-500/15 text-sky-700 dark:text-sky-300';
  }
}

function serializeCellContentList(content: readonly CellContent[]) {
  return content.map((cell) => serializeCellContent(cell)).join('\n\n');
}

function serializeCellContent(content: CellContent) {
  switch (content.type) {
    case 'audio':
      return `[audio cell]`;
    case 'codeBlock':
      return `\`\`\`${content.content.language}\n${content.content.code}\n\`\`\``;
    case 'data':
      return `\`\`\`json\n${JSON.stringify(content.content.value, null, 2)}\n\`\`\``;
    case 'boardReference':
      return `[board: ${content.content.name} (id: ${content.content.boardId})]`;
    case 'documentReference':
      return `[document: ${content.content.name} (id: ${content.content.documentId})]\n\n${content.content.contentSnapshot}`;
    case 'memoryReference':
      return `[memory: ${content.content.name} (memoryId: ${content.content.memoryId})]`;
    case 'header1':
      return `# ${content.content.text}`;
    case 'header2':
      return `## ${content.content.text}`;
    case 'image':
      return `[image](data:image/*;base64,${content.content.base64Data})`;
    case 'text':
      return content.content.text;
    case 'toolRegistration':
      return `**Tool registration:** \`${content.content.name}\` (${content.content.toolType}) — ${content.content.description}`;
    case 'toolUse':
      return `**Tool call:** \`${content.content.toolId}\` (call \`${content.content.callId}\`)\n\n\`\`\`json\n${JSON.stringify(content.content.input, null, 2)}\n\`\`\``;
    case 'toolResult': {
      const head = content.content.success ? 'Tool result' : 'Tool error';
      const errorSuffix = content.content.error === null ? '' : `\n\n_${content.content.error}_`;
      const innerText = content.content.content
        .map((inner) => (typeof inner.content === 'string' ? inner.content : JSON.stringify(inner.content)))
        .join('\n\n');
      return `**${head}** (\`${content.content.toolId}\` call \`${content.content.callId}\`)${errorSuffix}\n\n${innerText}`;
    }
  }
}
