import { Button, Header, PageLayout, Section, Surface } from '@two-pebble/components';
import type { PrOverviewBoardRecord, TrackedPrRecord } from '@two-pebble/realtime';
import { usePrOverview } from '@two-pebble/realtime';
import { useState } from 'react';

type EffectiveStatus = PrOverviewBoardRecord['tasks'][number]['task']['effectiveStatus'];
type PrDeliverable = PrOverviewBoardRecord['tasks'][number]['prDeliverables'][number];

// Non-terminal statuses only (the server omits completed tasks), in the order
// we want to read them top-to-bottom on the board.
const STATUS_ORDER: EffectiveStatus[] = ['working', 'waiting', 'open', 'blocked'];
const STATUS_LABELS: Record<string, string> = {
  blocked: 'Blocked',
  open: 'Open',
  waiting: 'Waiting on PR',
  working: 'Working',
};
const OPEN_PR_STATES = new Set<TrackedPrRecord['state']>(['mergeable', 'pending', 'unmergeable']);

export function OverviewPage() {
  const { boards } = usePrOverview();

  return (
    <PageLayout width="fixed">
      <Header>Open PRs by board</Header>
      {boards.length === 0 ? (
        <Surface>No incomplete tasks with PR requirements right now.</Surface>
      ) : (
        boards.map((board) => <BoardSection key={board.boardId} board={board} />)
      )}
    </PageLayout>
  );
}

function BoardSection(props: { board: PrOverviewBoardRecord }) {
  const { board } = props;
  const openPrCount = board.tasks.filter((entry) =>
    entry.prDeliverables.some((deliverable) => deliverable.pr !== null && OPEN_PR_STATES.has(deliverable.pr.state)),
  ).length;
  const undeliveredCount = board.tasks.filter((entry) =>
    entry.prDeliverables.some((deliverable) => deliverable.pr === null),
  ).length;
  const summary = `${board.tasks.length} task${board.tasks.length === 1 ? '' : 's'} · ${openPrCount} with open PRs · ${undeliveredCount} not yet submitted`;

  return (
    <Section actionItems={<CopyForReviewButton board={board} />} subtitle={summary} title={board.boardName}>
      {STATUS_ORDER.map((status) => {
        const tasks = board.tasks.filter((entry) => entry.task.effectiveStatus === status);
        if (tasks.length === 0) {
          return null;
        }
        return (
          <div key={status} className="mb-3">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-content-muted">
              {STATUS_LABELS[status] ?? status}
            </div>
            <Surface>
              {tasks.map((entry) => (
                <div key={entry.task.id} className="flex flex-col gap-1 border-b border-border py-2 last:border-0">
                  <span className="text-sm font-medium">{entry.task.name}</span>
                  {entry.prDeliverables.map((deliverable) => (
                    <PrDeliverableRow key={deliverable.deliverableId} deliverable={deliverable} />
                  ))}
                </div>
              ))}
            </Surface>
          </div>
        );
      })}
    </Section>
  );
}

function PrDeliverableRow(props: { deliverable: PrDeliverable }) {
  const { deliverable } = props;
  if (deliverable.pr === null) {
    return (
      <div className="flex items-center gap-2 pl-2 text-xs text-content-muted">
        <PrStateGlyph state={null} />
        <span>{deliverable.name}: no PR submitted yet</span>
      </div>
    );
  }
  const pr = deliverable.pr;
  const label = pr.title.length > 0 ? pr.title : `${pr.repo}#${pr.number}`;
  return (
    <div className="flex items-center gap-2 pl-2 text-xs">
      <PrStateGlyph state={pr.state} />
      <a className="truncate text-accent hover:underline" href={pr.url} rel="noreferrer" target="_blank">
        {label}
      </a>
      <span className="text-content-muted">
        {pr.repo}#{pr.number} · {pr.state}
      </span>
    </div>
  );
}

function PrStateGlyph(props: { state: TrackedPrRecord['state'] | null }) {
  const { state } = props;
  if (state === null) {
    return <span className="inline-flex size-4 items-center justify-center text-content-muted">○</span>;
  }
  const className =
    state === 'merged'
      ? 'text-violet-500'
      : state === 'closed'
        ? 'text-content-muted'
        : state === 'unmergeable'
          ? 'text-danger'
          : state === 'pending'
            ? 'text-warning'
            : 'text-success';
  const symbol =
    state === 'merged'
      ? '⎌'
      : state === 'closed'
        ? '×'
        : state === 'unmergeable'
          ? '!'
          : state === 'pending'
            ? '●'
            : '✓';
  return (
    <span
      aria-label={state}
      className={`inline-flex size-4 items-center justify-center font-semibold ${className}`}
      role="img"
    >
      {symbol}
    </span>
  );
}

function CopyForReviewButton(props: { board: PrOverviewBoardRecord }) {
  const [copied, setCopied] = useState(false);
  const openPrs = collectOpenPrs(props.board);

  const onCopy = () => {
    const text = openPrs.map((pr, index) => `${index + 1}. ${pr.label} — ${pr.url}`).join('\n');
    void navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      },
      () => undefined,
    );
  };

  return (
    <Button disabled={openPrs.length === 0} leftIcon="clipboard" onClick={onCopy} variant="secondary">
      {copied ? 'Copied!' : `Copy for review (${openPrs.length})`}
    </Button>
  );
}

function collectOpenPrs(board: PrOverviewBoardRecord): Array<{ label: string; url: string }> {
  const prs: Array<{ label: string; url: string }> = [];
  for (const entry of board.tasks) {
    for (const deliverable of entry.prDeliverables) {
      const pr = deliverable.pr;
      if (pr !== null && OPEN_PR_STATES.has(pr.state)) {
        prs.push({ label: pr.title.length > 0 ? pr.title : `${pr.repo}#${pr.number}`, url: pr.url });
      }
    }
  }
  return prs;
}
