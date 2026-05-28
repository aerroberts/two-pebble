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
 *
 * Inline cells (text, headers, references) flow together in a single
 * paragraph-like span so that document/board pills sit inline with the
 * surrounding text. Block cells (code, data, image) break out into their
 * own row.
 */
export function UserMessageTrace(props: TraceComponentProps<'user-message'>) {
  const cells = props.trace.data.content;
  const speakText = buildSpeakableText(cells);
  const groups = groupCellsForRender(cells);

  return (
    <AgentTraceItem
      content={
        <div className="flex w-full flex-col gap-2">
          {groups.map((group) => {
            if (group.kind === 'inline') {
              return (
                <p key={group.key} className="text-sm leading-relaxed text-content whitespace-pre-wrap break-words">
                  {group.cells.map((cell, cellIndex) => {
                    const key = `${group.key}-cell-${cellIndex}-${cellKey(cell)}`;
                    return <InlineUserMessageCell cell={cell} key={key} />;
                  })}
                </p>
              );
            }
            return <BlockUserMessageCell cell={group.cell} key={group.key} />;
          })}
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

type InlineGroup = { kind: 'inline'; cells: CellContent[]; key: string };
type BlockGroup = { kind: 'block'; cell: CellContent; key: string };
type CellGroup = InlineGroup | BlockGroup;

function groupCellsForRender(cells: readonly CellContent[]): CellGroup[] {
  const groups: CellGroup[] = [];
  let currentInline: CellContent[] = [];
  let nextGroupIndex = 0;
  const flushInline = () => {
    if (currentInline.length > 0) {
      groups.push({
        kind: 'inline',
        cells: currentInline,
        key: `inline-${nextGroupIndex}-${cellKey(currentInline[0] as CellContent)}`,
      });
      nextGroupIndex += 1;
      currentInline = [];
    }
  };
  for (const cell of cells) {
    if (isInlineCell(cell)) {
      currentInline.push(cell);
    } else {
      flushInline();
      groups.push({ kind: 'block', cell, key: `block-${nextGroupIndex}-${cellKey(cell)}` });
      nextGroupIndex += 1;
    }
  }
  flushInline();
  return groups;
}

function isInlineCell(cell: CellContent): boolean {
  switch (cell.type) {
    case 'text':
    case 'header1':
    case 'header2':
    case 'documentReference':
    case 'boardReference':
    case 'audio':
      return true;
    default:
      return false;
  }
}

function InlineUserMessageCell(props: { cell: CellContent }) {
  const { cell } = props;
  switch (cell.type) {
    case 'text':
      return <InlineText text={cell.content.text} />;
    case 'header1':
      return <InlineText text={cell.content.text} />;
    case 'header2':
      return <InlineText text={cell.content.text} />;
    case 'boardReference':
      return <BoardPill boardId={cell.content.boardId} name={cell.content.name} />;
    case 'documentReference':
      return <DocumentPill name={cell.content.name} documentId={cell.content.documentId} />;
    case 'audio':
      return (
        <InlineText
          text={
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

function BlockUserMessageCell(props: { cell: CellContent }) {
  const { cell } = props;
  switch (cell.type) {
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
    case 'image':
      return <MarkdownView content={`[image](data:image/*;base64,${cell.content.base64Data})`} />;
    default:
      return null;
  }
}

function InlineText(props: { text: string }) {
  // Strip only newline runs at the very start/end. Composer text segments
  // come delimited by the `\n\n` paragraph separator from
  // `tipTapDocToCells`, which would otherwise inject visible blank lines
  // between an inline pill and its neighbouring text. Internal whitespace
  // is preserved (the surrounding paragraph uses `whitespace-pre-wrap`)
  // so spaces the user typed around a pill still render.
  const trimmed = props.text.replace(/^\n+/, '').replace(/\n+$/, '');
  if (trimmed.length === 0) {
    return null;
  }
  return <span>{trimmed}</span>;
}

function DocumentPill(props: { documentId: string; name: string }) {
  return (
    <a
      className="mx-0.5 inline-flex items-center gap-1 rounded-md border border-border bg-surface px-1.5 py-0 align-baseline text-[11px] font-medium leading-4 text-content no-underline transition-colors hover:border-accent hover:text-accent"
      data-document-id={props.documentId}
      href={`/documents/${props.documentId}`}
    >
      <span aria-hidden="true" className="text-content-muted">
        doc:
      </span>
      {props.name.length > 0 ? props.name : 'document'}
    </a>
  );
}

function BoardPill(props: { boardId: string; name: string }) {
  return (
    <a
      className="mx-0.5 inline-flex items-center gap-1 rounded-md border border-border bg-surface px-1.5 py-0 align-baseline text-[11px] font-medium leading-4 text-content no-underline transition-colors hover:border-accent hover:text-accent"
      data-board-id={props.boardId}
      href={`/tasks/${props.boardId}`}
    >
      <span aria-hidden="true" className="text-content-muted">
        board:
      </span>
      {props.name.length > 0 ? props.name : 'board'}
    </a>
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
