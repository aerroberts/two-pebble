import { collectCellTextById, extractComments, type TipTapDocument } from '@two-pebble/datatypes';

export interface DocumentCommentsRenderProps {
  doc: TipTapDocument;
}

export function DocumentCommentsRender(props: DocumentCommentsRenderProps) {
  const threads = extractComments(props.doc);
  if (threads.length === 0) {
    return null;
  }
  const cellTextById = collectCellTextById(props.doc);
  const active = threads.filter((thread) => cellTextById.has(thread.cellId));
  const orphaned = threads.filter((thread) => !cellTextById.has(thread.cellId));

  return (
    <section className="mt-8 border-t border-border pt-4">
      <h2 className="text-sm font-semibold text-content">Comments</h2>
      <div className="mt-3 flex flex-col gap-4">
        {active.map((thread) => (
          <ThreadRender key={thread.cellId} cellText={cellTextById.get(thread.cellId) ?? ''} thread={thread} />
        ))}
        {orphaned.length > 0 ? (
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-content-muted">Orphaned</h3>
            {orphaned.map((thread) => (
              <ThreadRender key={thread.cellId} cellText="(deleted)" thread={thread} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ThreadRender(props: { cellText: string; thread: ReturnType<typeof extractComments>[number] }) {
  return (
    <article className="flex flex-col gap-2">
      <blockquote className="border-l-2 border-border-strong pl-3 text-[12px] leading-5 text-content-muted">
        {props.cellText.length === 0 ? '(empty)' : props.cellText}
      </blockquote>
      <div className="flex flex-col gap-1">
        {props.thread.comments.map((comment) => (
          <div key={comment.id} className="text-[12px] leading-5 text-content">
            <span className="font-medium">{comment.authorId}</span>
            <span className="text-content-muted">
              {' '}
              ({props.thread.status}
              {props.thread.status === 'closed' ? `: ${props.thread.closedReason ?? 'no reason'}` : ''}):
            </span>{' '}
            {comment.body}
          </div>
        ))}
      </div>
    </article>
  );
}
