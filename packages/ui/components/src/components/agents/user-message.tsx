import type { CellContent } from '@two-pebble/pebble';
import { MarkdownView } from '../code/markdown/markdown';
import { AgentTraceItem } from './agent-trace-item';
import { SpeakTextButton } from './speak-text-button';
import { TraceBodyCell } from './trace-body-cell';
import type { TraceComponentProps } from './types';

/**
 * Renders a user-message trace by walking the durable cell list and
 * picking the right renderer per variant — markdown for text, a
 * code block view for `codeBlock`, a JSON grid for `data`, and an
 * inline pill for `documentReference`. The legacy stringifier
 * collapsed everything to markdown which lost document pill semantics.
 */
export function UserMessageTrace(props: TraceComponentProps<'user-message'>) {
  const cells = props.trace.data.content;
  const speakText = buildSpeakableText(cells);

  return (
    <AgentTraceItem
      content={
        <div className="flex flex-col gap-2">
          {cells.map((cell) => (
            <UserMessageCell cell={cell} key={cellKey(cell)} />
          ))}
        </div>
      }
      icon="User"
      status="atomic"
      timestamp={props.trace.createdAt}
      title="User Message"
      titleAction={
        props.speakController === undefined ? undefined : (
          <SpeakTextButton text={speakText} controller={props.speakController} />
        )
      }
    />
  );
}

function UserMessageCell(props: { cell: CellContent }) {
  const { cell } = props;
  switch (cell.type) {
    case 'text':
      return <MarkdownView content={cell.content.text} />;
    case 'header1':
      return <MarkdownView content={`# ${cell.content.text}`} />;
    case 'header2':
      return <MarkdownView content={`## ${cell.content.text}`} />;
    case 'codeBlock':
      return (
        <TraceBodyCell
          data={cell.content.code}
          label={cell.content.language.length > 0 ? cell.content.language : 'code'}
          type="plaintext"
        />
      );
    case 'data':
      return <TraceBodyCell data={cell.content.value} label="data" type="json" />;
    case 'boardReference':
      return <BoardPill boardId={cell.content.boardId} name={cell.content.name} />;
    case 'documentReference':
      return <DocumentPill name={cell.content.name} documentId={cell.content.documentId} />;
    case 'image':
      return <MarkdownView content={`[image](data:image/*;base64,${cell.content.base64Data})`} />;
    case 'audio':
      return (
        <MarkdownView
          content={
            cell.content.transcript == null || cell.content.transcript.length === 0
              ? '[audio]'
              : `[audio: ${cell.content.transcript}]`
          }
        />
      );
    default:
      return null;
  }
}

function DocumentPill(props: { documentId: string; name: string }) {
  return (
    <span
      className="inline-flex w-fit items-center gap-1 rounded-md border border-border bg-surface-alt px-1.5 py-0.5 text-[11px] font-medium text-content"
      data-document-id={props.documentId}
    >
      <span aria-hidden="true" className="text-content-muted">
        doc:
      </span>
      {props.name.length > 0 ? props.name : 'document'}
    </span>
  );
}

function BoardPill(props: { boardId: string; name: string }) {
  return (
    <span
      className="inline-flex w-fit items-center gap-1 rounded-md border border-border bg-surface-alt px-1.5 py-0.5 text-[11px] font-medium text-content"
      data-board-id={props.boardId}
    >
      <span aria-hidden="true" className="text-content-muted">
        board:
      </span>
      {props.name.length > 0 ? props.name : 'board'}
    </span>
  );
}

function cellKey(cell: CellContent): string {
  switch (cell.type) {
    case 'boardReference':
      return `boardReference:${cell.content.boardId}`;
    case 'documentReference':
      return `documentReference:${cell.content.documentId}`;
    case 'text':
      return `text:${cell.content.text}`;
    case 'codeBlock':
      return `codeBlock:${cell.content.language}:${cell.content.code}`;
    case 'data':
      return `data:${JSON.stringify(cell.content.value)}`;
    case 'header1':
    case 'header2':
      return `${cell.type}:${cell.content.text}`;
    case 'image':
      return `image:${cell.content.base64Data.slice(0, 16)}`;
    case 'audio':
      return `audio:${cell.content.transcript ?? ''}`;
    default:
      return cell.type;
  }
}

function buildSpeakableText(cells: readonly CellContent[]): string {
  const parts: string[] = [];
  for (const cell of cells) {
    switch (cell.type) {
      case 'text':
        parts.push(cell.content.text);
        break;
      case 'header1':
      case 'header2':
        parts.push(cell.content.text);
        break;
      case 'documentReference':
        parts.push(`@${cell.content.name}`);
        break;
      case 'boardReference':
        parts.push(`#${cell.content.name}`);
        break;
      case 'codeBlock':
        parts.push(cell.content.code);
        break;
      case 'audio':
        if (cell.content.transcript != null && cell.content.transcript.length > 0) {
          parts.push(cell.content.transcript);
        }
        break;
      default:
        break;
    }
  }
  return parts.join('\n\n');
}
