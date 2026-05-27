'use client';

import type { TipTapDocument } from '@two-pebble/datatypes';
import { extractComments } from '@two-pebble/datatypes';
import { useEffect, useMemo, useState } from 'react';
import { Icon } from '../content/icon/icon';
import { Button } from '../input/button/button';
import { InputArea } from '../input/input-area/input-area';

export interface CommentPopoverProps {
  open: boolean;
  cellId: string;
  anchorElement: HTMLElement | null;
  doc: TipTapDocument;
  onAddComment: (body: string) => void;
  onCloseThread: (closedReason: string) => void;
  onCancel: () => void;
}

interface PopoverPosition {
  left: number;
  top: number;
}

export function CommentPopover(props: CommentPopoverProps) {
  const [body, setBody] = useState('');
  const [closedReason, setClosedReason] = useState('');
  const [position, setPosition] = useState<PopoverPosition>({ left: 0, top: 0 });
  const thread = useMemo(
    () => extractComments(props.doc).find((item) => item.cellId === props.cellId) ?? null,
    [props.doc, props.cellId],
  );

  useEffect(() => {
    if (!props.open) {
      setBody('');
      setClosedReason('');
    }
  }, [props.open]);

  useEffect(() => {
    if (!props.open || props.anchorElement === null) {
      return undefined;
    }
    let frame = 0;
    const update = () => {
      if (props.anchorElement === null || !props.anchorElement.isConnected) {
        props.onCancel();
        return;
      }
      const rect = props.anchorElement.getBoundingClientRect();
      setPosition({
        left: Math.min(rect.right + 12, Math.max(12, window.innerWidth - 332)),
        top: Math.min(rect.top, Math.max(12, window.innerHeight - 360)),
      });
      frame = window.requestAnimationFrame(update);
    };
    frame = window.requestAnimationFrame(update);
    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [props.open, props.anchorElement, props.onCancel]);

  if (!props.open) {
    return null;
  }

  const canSubmit = body.trim().length > 0;
  const canClose = closedReason.trim().length > 0;
  const isOpen = thread?.status !== 'closed';

  return (
    <div
      className="fixed z-[1200] flex w-[320px] flex-col overflow-hidden rounded-md border border-border bg-surface-raised shadow-modal"
      style={{ left: position.left, top: position.top }}
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <Icon color="text-accent" name="messages-square" />
          <span className="truncate text-[12px] font-semibold text-content">
            {thread === null
              ? 'New comment'
              : `${thread.comments.length} comment${thread.comments.length === 1 ? '' : 's'}`}
          </span>
        </div>
        <button
          aria-label="Close comments"
          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-content-muted hover:bg-surface-hover hover:text-content"
          onClick={props.onCancel}
          type="button"
        >
          <Icon color="text-current" name="x" className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="max-h-[180px] overflow-y-auto px-3 py-2">
        {thread === null ? (
          <div className="text-[12px] text-content-muted">No comments on this cell.</div>
        ) : (
          <div className="flex flex-col gap-2">
            {thread.comments.map((comment) => (
              <div key={comment.id} className="rounded-md border border-border bg-surface px-2 py-1.5">
                <div className="mb-1 flex items-center justify-between gap-2 text-[11px] text-content-muted">
                  <span className="truncate font-medium">{comment.authorId}</span>
                  <span>{new Date(comment.createdAt).toLocaleString()}</span>
                </div>
                <div className="whitespace-pre-wrap text-[12px] leading-5 text-content">{comment.body}</div>
              </div>
            ))}
            {thread.status === 'closed' ? (
              <div className="rounded-md border border-border bg-surface-alt px-2 py-1.5 text-[12px] text-content-muted">
                Closed: {thread.closedReason}
              </div>
            ) : null}
          </div>
        )}
      </div>
      <div className="border-t border-border px-3 py-2">
        <InputArea
          aria-label="Comment body"
          placeholder={thread?.status === 'closed' ? 'Add a comment to reopen...' : 'Add a comment...'}
          rows={3}
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
        <div className="mt-2 flex justify-end gap-2">
          <Button
            disabled={!canSubmit}
            leftIcon={thread?.status === 'closed' ? 'refresh-cw' : 'send'}
            onClick={() => {
              const trimmed = body.trim();
              if (trimmed.length === 0) {
                return;
              }
              props.onAddComment(trimmed);
              setBody('');
            }}
            type="button"
            variant="primary"
          >
            {thread?.status === 'closed' ? 'Reopen' : 'Add'}
          </Button>
        </div>
      </div>
      {thread !== null && isOpen ? (
        <div className="border-t border-border px-3 py-2">
          <InputArea
            aria-label="Close reason"
            placeholder="Close reason..."
            rows={2}
            value={closedReason}
            onChange={(event) => setClosedReason(event.target.value)}
          />
          <div className="mt-2 flex justify-end">
            <Button
              disabled={!canClose}
              leftIcon="circle-check"
              onClick={() => {
                const trimmed = closedReason.trim();
                if (trimmed.length === 0) {
                  return;
                }
                props.onCloseThread(trimmed);
                setClosedReason('');
              }}
              type="button"
            >
              Close
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
