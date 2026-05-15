# Plan: `todoItem` TipTap node + `/task` + document-scoped progressive task list

## Scope (literal restatement)

> A new custom TipTap component named `todoItem`, rendered as a checkbox
> with a description, summonable via `/task`, **enabled only for document
> editing in bodies**. When a document is sent to an agent, extract the
> todos. Register the progressive-task-list capability so the agent can
> tick them off.

Two key constraints distinguish this from the prior draft in
`plan-todo-item.md`:

1. **Document-editor-only.** The node and the `/task` slash command are
   wired into `TipTapEditor` (used by `DocumentEditorPage`) only. The
   chat composer (`RichMessageComposer`) is **not** touched.
2. **Reuse the existing `progressive-task-list` capability** rather than
   defining a new one. Document todos become its task source. Open
   question Q1 below covers the one place this gets awkward; if the
   answer is "no, you must add a new capability," promote that section
   to a phase and the rest of the plan stands.

---

## Assumptions

- **A1.** Document content is stored as TipTap JSON (string) in the
  datastore. Confirmed by `markdownToTipTap` / `tipTapToMarkdown` at
  `packages/data/datatypes/src/document-content.ts:54` and by the
  `contentSnapshot` round-trip in `resolveDocumentReferenceCells`
  (`packages/service/daemon/src/handlers/resolve-document-reference-cells.ts:17`).
- **A2.** Adding a new `addAttributes` field to a TipTap node does not
  require any schema migration on the documents table — the JSON column
  stores arbitrary attrs.
- **A3.** The agent receives documents via the `documentReference` cell
  (`packages/service/pebble/src/thread/cells/cells/document-reference.ts`),
  which already carries `contentSnapshot`. We can extend this cell
  additively without breaking existing consumers.
- **A4.** Existing `task-list-update` traces
  (`packages/service/pebble/src/traces/agent-traces/task-list-update.ts`)
  and their React renderer
  (`packages/ui/components/src/components/agents/task-list-update.tsx`)
  are reusable as-is for document todos.
- **A5.** Markdown ingestion of GFM `- [ ]` tasklists into `todoItem`
  nodes is **out of scope** for v1. Round-trip serialization is
  best-effort (see Phase 1.4).
- **A6.** Single-document scope per agent for v1. Multi-document task
  aggregation is a follow-up.

---

## Phase 1 — `TodoItemNode` (TipTap)

### 1.1 New extension module

Create
`packages/ui/components/src/components/editor/todo-item-node.tsx`.
Pattern: `Node.create()` like `DocumentMentionNode`
(`packages/ui/components/src/components/input/rich-message-composer/document-mention-node.ts:15`).

Node shape:

| field | value |
|---|---|
| `name` | `'todoItem'` |
| `group` | `'block'` |
| `content` | `'inline*'` |
| `defining` | `true` (Enter splits into a sibling todo) |
| attrs.`id` | stable ULID generated at insertion; persists across toggles |
| attrs.`status` | `'open' \| 'completed' \| 'invalid'`, default `'open'` |
| attrs.`completionType` | optional `'manual' \| 'automatic'` |

Render:

- `parseHTML`: `li[data-todo-id]`.
- `renderHTML`: `<li>` with `data-todo-id` and `data-todo-status`.
- `addNodeView` + `ReactNodeViewRenderer` from `@tiptap/react` to
  render the real interactive checkbox. The node view reuses the
  existing `Checkbox` component
  (`packages/ui/components/src/components/input/checkbox/checkbox.tsx`).
  The checkbox is `contenteditable="false"`; the description body is
  editable inline.

The status enum mirrors `TaskListUpdateStatus` from
`packages/service/pebble/src/traces/agent-traces/task-list-update.ts`
so trace emission is trivial.

### 1.2 Commands & keybindings

- `addCommands`:
  - `insertTodoItem({ text? })` — inserts a fresh `todoItem` with a new
    ULID and optional initial text.
  - `toggleTodoItem()` — flips the status of the todo containing the
    selection between `open` and `completed`.
- `addKeyboardShortcuts`:
  - `Mod-Enter` → toggle status.
  - `Enter` inside an empty todo → split out as a paragraph (Notion
    "exit list" behaviour).
  - `Backspace` at start of empty todo → convert to paragraph.

### 1.3 Register on `TipTapEditor` only

Edit `packages/ui/components/src/components/editor/tiptap-editor.tsx`
(lines 20–25) to add `TodoItemNode` to the `extensions` array.

**Do not** register on `RichMessageComposer`. Per the scope statement,
todo nodes do not exist in the chat composer.

### 1.4 Markdown round-trip (best-effort v1)

The document storage layer uses ProseMirror's markdown serializer (see
`packages/data/datatypes/src/document-content.ts:54`), which has no
knowledge of `todoItem`. Options:

- **v1 (chosen):** Treat the TipTap JSON as the source of truth.
  `tipTapToMarkdown` falls back to rendering todos as `- [ ]` / `- [x]`
  text so a markdown export is human-readable. `markdownToTipTap` does
  *not* re-parse them into `todoItem` nodes — they come back as
  bullet-list items. Document this limitation.
- **v2 (follow-up):** Teach both halves of the bridge about `todoItem`
  so `- [ ]` round-trips cleanly. Wait for product demand.

### 1.5 Tests

In `packages/ui/components/src/components/editor/`:

- Snapshot: `<TipTapEditor>` renders a sample doc with one todo;
  toggling the checkbox updates `data-todo-status` and preserves `id`.
- Command: `editor.commands.insertTodoItem({ text: 'x' })` produces a
  node with a non-empty ULID.
- Keybinding: Enter inside an empty todo exits to a paragraph.

---

## Phase 2 — `/task` slash command in the document editor

`TipTapEditor` does not currently have any slash machinery — the
existing `readActiveSlashTrigger` and `SlashDocumentPopover` live in
`packages/ui/components/src/components/input/rich-message-composer/`.
They are coupled to `RichMessageComposer` and assume "/doc only."

### 2.1 Lift the slash primitive into a shared module

**Where it lives.** New folder
`packages/ui/components/src/components/editor/slash/`:

| file | exports |
|---|---|
| `slash-trigger.ts` | `readActiveSlashTrigger(editor): SlashTrigger \| null` (pure function over `editor.state`) and the `SlashTrigger` type `{ command: string; query: string; anchor: { from: number; to: number; coords: { left: number; top: number } } }` |
| `use-slash-trigger.ts` | `useSlashTrigger(editor): SlashTrigger \| null` — a React hook that subscribes to `editor.on('update')` and `editor.on('selectionUpdate')`, recomputes the trigger, and unsubscribes on unmount. Returns `null` when the cursor is not in a `/word` context. |
| `delete-trigger-range.ts` | `deleteTriggerRange(editor, trigger): void` — utility that removes the `/word query` text run, leaving the cursor at the deletion point so the caller can insert whatever node it wants. |
| `index.ts` | barrel re-exports for the above. |

**What does *not* move.** Everything UI-specific stays out of the
shared module:

- `SlashDocumentPopover.tsx` (the document picker) stays in
  `rich-message-composer/` — it is bound to chat-input concerns.
- `replaceTriggerWithDocumentMention` stays in `rich-message-composer/`;
  internally it is refactored to call the shared
  `deleteTriggerRange` + the composer's own
  `editor.commands.insertDocumentMention(...)`.

**Shape change.** The trigger now carries `command: string` (the
leading word — `'doc'`, `'task'`, …). Composer call sites filter to
`command === 'doc'`; everything else they see is ignored.

**No reverse imports.** `editor/slash/` must not import from
`rich-message-composer/`. A lint check / boundaries rule should catch
accidental regressions — if the repo already has a guardrails config
(see `*.guard` files in the working-tree status), add the rule there.

### 2.2 How the document editor consumes it

In a thin wrapper component (e.g. `DocumentTipTapEditor`) that the
document page renders instead of `TipTapEditor` directly — or inline
in `DocumentEditorPage` if simpler:

```tsx
const editor = useEditor({ extensions: [..., TodoItemNode], ... });
const trigger = useSlashTrigger(editor);

return (
  <>
    <EditorContent editor={editor} />
    {trigger?.command === 'task' && (
      <SlashTaskHint
        editor={editor}
        trigger={trigger}
        onCommit={(text) => {
          deleteTriggerRange(editor, trigger);
          editor.commands.insertTodoItem({ text });
        }}
        onDismiss={() => { /* let the literal text stand */ }}
      />
    )}
  </>
);
```

`SlashTaskHint` lives at
`packages/ui/components/src/components/editor/slash/slash-task-hint.tsx`.
It is intentionally small: a single absolutely-positioned div
anchored to `trigger.anchor.coords` reading "Press Enter to add task:
`<query>`". On Enter it calls `onCommit(trigger.query)`; on Escape it
calls `onDismiss()`. No popover, no list, no portal infrastructure —
the composer's `SlashDocumentPopover` is never imported.

**Why a hook, not an effect inside `TipTapEditor`.** Keeping the
trigger subscription outside `TipTapEditor` means the base editor
component stays surface-agnostic (the chat composer wraps it the same
way) and there's no `if (isDocumentEditor) …` branching inside the
shared editor.

**Event sources.** `useSlashTrigger` subscribes to `update` (catches
typing) and `selectionUpdate` (catches arrow-key movement out of a
trigger). On either fire, it re-runs the pure `readActiveSlashTrigger`
and stores the result in state.

### 2.3 Toolbar affordance

Add an "Add task" button to `DocumentEditorPage` near the existing
header actions
(`packages/ui/app/src/pages/documents/document-editor.page.tsx:17`).
Clicking calls `editor.chain().focus().insertTodoItem().run()`. This
is a discoverability aid; the slash command is the primary path.

### 2.4 Tests

- Typing `/task buy milk` then Enter produces one `todoItem` with
  `text === 'buy milk'` and no leftover `/task` text in the doc.
- Toolbar button inserts a `todoItem` at the cursor.

---

## Phase 3 — Extract todos when document is sent to an agent

### 3.1 Extraction helper

Create
`packages/data/datatypes/src/document-todos.ts`:

```ts
export interface DocumentTodo {
  id: string;
  status: 'open' | 'completed' | 'invalid';
  text: string;
  completionType?: 'manual' | 'automatic';
}

export function extractTodos(doc: TipTapDocument): DocumentTodo[];
export function applyTodoStatus(
  doc: TipTapDocument,
  id: string,
  status: DocumentTodo['status'],
  completionType?: 'manual' | 'automatic',
): TipTapDocument;
```

`extractTodos` walks the JSON looking for `node.type === 'todoItem'`
and flattens inline text from `node.content`. `applyTodoStatus`
returns a new doc with the targeted todo's attrs updated; the rest of
the tree is preserved by reference.

Unit tests colocated, fixture style similar to
`tiptap-doc-to-cells.test-fixtures.ts`.

### 3.2 Extend the `documentReference` cell

Edit
`packages/service/pebble/src/thread/cells/cells/document-reference.ts`
to add an optional field:

```ts
{
  documentId: string;
  name: string;
  contentSnapshot?: string;
  documentUpdatedAt?: number;
  todos?: DocumentTodo[];   // new — see §3.3 for what goes in here
}
```

Additive — existing consumers ignore the new field.

### 3.3 What we put in `todos` (full list, not filtered)

The cell carries **the full extracted list**, including completed and
invalid items. Reasoning:

- The cell is the wire/storage representation; trimming it loses
  information that downstream consumers (capability seeding, future
  multi-doc aggregation, UI badges) may want.
- Per-consumer filtering is easy when the full list is present;
  reconstructing the full list from a filtered cell is impossible.
- Cost is small: todo records are tiny compared to `contentSnapshot`.

`extractTodos` therefore emits every `todoItem` it sees, regardless of
status. Filtering for the prompt happens later, in §3.5.

### 3.4 Populate in the resolver

In `resolveDocumentReferenceCells`
(`packages/service/daemon/src/handlers/resolve-document-reference-cells.ts:17`),
after the `documents.read`:

```ts
let todos: DocumentTodo[] = [];
try {
  const parsed = JSON.parse(row.content) as TipTapDocument;
  todos = extractTodos(parsed);
} catch (err) {
  // Document content is corrupt or pre-TipTap markdown; log and ship
  // the cell without todos rather than failing the whole resolve.
  logger.warn({ err, documentId: row.id }, 'extractTodos: parse failed');
}

resolved.push(
  Cell.documentReference({
    documentId: row.id,
    name: row.name,
    contentSnapshot: row.content,
    documentUpdatedAt: row.updatedAt,
    todos,
  }),
);
```

Called by both `agent.message.handler.ts` and
`agent.launch.handler.ts`, so both paths get todos for free.

### 3.5 Surface todos to the model (filtered + capability-gated)

In each provider's render-cell function (already dirty in the working
tree):

- `packages/service/pebble/src/providers/providers/anthropic/render-text-cell.ts`
- `…/ollama/render-text-cell.ts`
- `…/openai/open-aiprovider.ts` (text cell rendering)
- `…/openrouter/open-router-provider.ts`

When rendering a `documentReference` cell whose `todos` is non-empty,
append a structured block after the content:

```
<document name="Plan" id="doc-…">
  …contentSnapshot…
  <open-tasks>
    - id=01J… status=open  "Wire daemon resolver"
    - id=01J… status=open  "Add capability"
  </open-tasks>
</document>
```

Two rules govern what shows up in the block:

1. **Only `status === 'open'` items are rendered.** Completed and
   invalid items are skipped to keep context lean. The full list is
   still on the cell for other consumers.
2. **The block is rendered only when the agent has
   `progressive-task-list` enabled with `documentId` matching this
   `documentReference` cell.** If the agent has no way to act on
   tasks, surfacing the ids would be noise (and a footgun — the model
   might hallucinate a `mark-task-complete` call that errors). The
   render function therefore needs access to the active agent's
   capability set; if that is not already threaded through the
   render-cell signature, extend it.

If §3.5 rule 2 is unsatisfied, the document still renders, just
without the `<open-tasks>` block. Todos in the cell remain available
for any other consumer.

### 3.6 Ordering: where this sits in the message-handling pipeline

The capability needs to be attached (and its `documentId` set) before
the prompt is rendered, so that the rule-2 gate in §3.5 can resolve.
The full sequence on a `/task`-driven message from
`DocumentEditorPage`:

1. **Handler entry** (`agent.message.handler.ts` /
   `agent.launch.handler.ts`).
2. **Capability auto-attach** (Phase 4.4) — handler ensures the
   target agent's `progressive-task-list` capability is configured
   with `documentId: <this doc>` *before* anything else. For a fresh
   launch this means seeding the capability config at construction
   time; for an existing agent, see Phase 4.4 for conflict rules.
3. **Cell resolution** — `resolveDocumentReferenceCells` runs,
   populating the cell's full `todos` array (§3.4).
4. **Agent turn boundary** — `hookBeforeAgentTurn` on
   `progressive-task-list` runs, re-reads the document via the
   document runner, and seeds the in-memory `tasks` state slot from
   `extractTodos` (Phase 4.2). This produces a `task-list-update`
   trace if statuses changed since the last seed.
5. **Provider prompt render** — provider walks the cell list. For
   the `documentReference` cell, applies the rule-2 gate (the
   capability registered in step 2 makes the gate pass), filters
   `todos` to opens (§3.5 rule 1), emits the `<open-tasks>` block.
6. **Model call** — model sees the prompt with open tasks listed by
   id, can call `mark-task-complete` / `mark-task-invalid` against
   those ids.
7. **Tool side-effect** — capability tools update in-memory state
   *and* persist via `applyTodoStatus` + document runner (Phase 4.2),
   so the human sees the checkbox flip on next document re-read.

Steps 2 → 3 → 4 → 5 ordering is load-bearing: skip step 2 and the
gate in step 5 always fails; reorder 4 after 5 and the trace fires
*after* the model has already seen a stale snapshot.

### 3.7 Tests

Three resolver/render tests:

- **Resolver completeness.** A document with three todos (one open,
  one completed, one invalid) produces a cell whose `todos` field has
  all three entries with correct statuses.
- **Render with capability enabled.** Run the resolver → provider
  render with a mock agent that has `progressive-task-list` enabled
  for this `documentId`. Assert the rendered text contains the open
  id and *not* the completed/invalid ones.
- **Render with capability disabled.** Same input, but the mock agent
  has no `progressive-task-list` (or it's bound to a different
  `documentId`). Assert the `<open-tasks>` block is omitted entirely
  while the document content still renders.

---

## Phase 4 — Wire the `progressive-task-list` capability to documents

### 4.1 Why reuse, not replace

`ProgressiveTaskListCapability`
(`packages/service/pebble/src/capabilities/progressive-task-list/progressive-task-list-capability.ts:28`)
already:

- Tracks a `tasks` state slot keyed by id.
- Emits `task-list-update` traces on diff.
- Ships `mark-task-complete` / `mark-task-invalid` tools.

For document todos we need exactly these three behaviours plus a way
to mirror status changes back into the stored document JSON.

### 4.2 New seed source: document todos

Extend the capability constructor / params to accept an optional
`documentId`:

```ts
new ProgressiveTaskListCapability({ documentId?: string })
```

When `documentId` is set:

- `hookBeforeAgentTurn` re-reads the document via the existing
  document-runner injection (the same pattern used by
  `DocumentWriterCapability` at
  `packages/service/pebble/src/capabilities/document-writer/document-writer-capability.ts:122`),
  runs `extractTodos`, and seeds / refreshes the in-memory `tasks`
  state slot from those todos. ids carry over from the document.
- `mark-task-complete` and `mark-task-invalid` get an additional
  side-effect: after updating in-memory state, call
  `applyTodoStatus(doc, taskId, status)` and persist via the runner so
  the document checkbox flips for the human viewer too.
- If `documentId` is unset, the capability behaves exactly as today
  (agent-launch-scoped, no document side effect).

This keeps the trace UI, dedup logic, and capability id (`'progressive-task-list'`)
all unchanged.

### 4.3 Registration

- `capability-ids.ts` — no change; we reuse the existing id.
- `capability-registry.ts` (`newCapability`, line 23) — extend the
  `'progressive-task-list'` arm to read `documentId` from params if
  the registry config provides it.
- Agent registry UI: when the user attaches `progressive-task-list` to
  a registry, expose an optional `documentId` selector (or a "scope to
  current document" toggle for `/task`-launched agents).

### 4.4 Auto-attach and conflict resolution

**Trigger.** When a launch or message originates from
`DocumentEditorPage` (the call carries a `sourceDocumentId` on the
launch / message payload — add the field if it does not already
exist), the daemon handler tries to ensure the target agent has
`progressive-task-list` enabled with
`{ documentId: <sourceDocumentId> }` *before* the cell-resolution
step (see §3.6).

**Three cases, three decisions:**

| State of target agent's `progressive-task-list` | Decision |
|---|---|
| Not enabled at all | Construct the capability with `{ documentId: <sourceDocumentId> }` at launch time. For `agent.message.handler.ts` against an already-running agent, the capability set is frozen at launch — see "Existing-agent path" below. |
| Enabled, `documentId === sourceDocumentId` | No-op. Capability is already correctly bound. |
| Enabled, `documentId === otherDocId` (or `documentId` unset) | **Reject mid-life rebind.** Capability binding is immutable for the lifetime of an agent. Do *not* mutate it. The handler still resolves the source document into a `documentReference` cell (so the agent can *read* the new doc), but the `<open-tasks>` block in §3.5 will *not* render for the new doc — its rule-2 gate fails. The agent's capability tools continue to operate against the originally bound doc. Surface a user-facing warning in the document editor: "This agent is bound to `<otherDocName>` for tasks. Tasks in this document are read-only here. Launch a new agent to enable task editing on this document." |

**Existing-agent path (the messaging case).** `agent.message.handler`
cannot retroactively *add* a capability to a running agent — the
capability registry is constructed at launch time and the in-memory
agent has already initialized its capability set. Two consequences:

1. If a user opens `DocumentEditorPage` for doc Y, types a message
   targeting an existing agent that was launched without
   `progressive-task-list`, the handler does not silently grant it.
   The doc is still attached as a `documentReference` cell; tasks are
   read-only as above. Same UI warning fires.
2. The document editor's primary "send to agent" UX therefore
   defaults to **launching a fresh agent per document session** (not
   reusing an existing one). This sidesteps the conflict in the
   common case and keeps the "send to existing agent" path as a
   deliberate, advanced action with the warning.

**Why reject instead of reset or widen.**

- *Reset* (silently rebind `documentId`) destroys in-memory task
  state for the original doc and surprises the user — the agent
  would suddenly stop tracking what it was tracking. Hard to
  diagnose, easy to lose work.
- *Widen* (let `documentId` be a `Set<string>`) is the eventually-
  correct answer for multi-doc agents but requires re-keying the
  capability's `tasks` slot by `(documentId, todoId)` everywhere,
  changing tool schemas to take `documentId`, and updating the trace
  UI to group by document. Real work — defer to a follow-up phase if
  product demand appears.
- *Reject* is the smallest change that keeps the system honest. It
  also makes the "launch fresh per doc session" UX the path of least
  resistance, which is the right default for v1.

**Confirm before merge.** If you'd rather the document editor's
existing-agent path silently rebinds (option *reset*), flag that and
the change is localized to this section + the gate in §3.5.

### 4.5 Tests

Mirror the existing progressive-task-list test harness:

- Capability seeded from a document with three open todos → first
  turn emits a `task-list-update` trace listing all three.
- Tool marks a todo complete → in-memory state updates *and* document
  on disk has the matching `todoItem` with `status: completed`.
- Two tool calls in the same turn → one coalesced trace.
- Tool against an unknown id → typed error, no document mutation.

---

## Phase 5 — Optional polish

- Header badge on `DocumentEditorPage` showing "3 of 7 done", computed
  from `extractTodos`.
- Keyboard shortcut on the document editor: `Cmd-Shift-T` inserts a
  new todo, parallel to the toolbar button.
- Hide the slash hint UI on touch devices where typing `/task` is
  awkward.

---

## Files to add

- `packages/ui/components/src/components/editor/todo-item-node.tsx`
- `packages/ui/components/src/components/editor/todo-item-node.test.tsx`
- `packages/ui/components/src/components/editor/slash/` (lifted
  generic slash primitive — exact filenames depend on how much we
  extract from the existing `rich-message-composer/slash-trigger.ts`)
- `packages/data/datatypes/src/document-todos.ts`
- `packages/data/datatypes/src/document-todos.test.ts`

## Files to modify

UI / editor:

- `packages/ui/components/src/components/editor/tiptap-editor.tsx`
  — register `TodoItemNode`. (Slash detection lives in the wrapper
  component per §2.2, not here, so the base editor stays surface-
  agnostic.)
- `packages/ui/app/src/pages/documents/document-editor.page.tsx`
  — mount the slash wrapper from §2.2; add "Add task" toolbar
  button; optional done-count badge; surface the §4.4 "task-editing
  read-only here" warning when the daemon returns it.
- `packages/ui/components/src/components/input/rich-message-composer/slash-trigger.ts`
  — slim to a thin re-export of the new shared module; update
  callers to filter by `command === 'doc'`.
- `packages/ui/components/src/components/input/rich-message-composer/rich-message-composer.tsx`
  — update callers of `replaceTriggerWithDocumentMention` if its
  signature changes during the lift.

Wire / cells:

- `packages/service/pebble/src/thread/cells/cells/document-reference.ts`
  — add optional `todos` field (full list, per §3.3).
- `packages/service/daemon/src/handlers/resolve-document-reference-cells.ts`
  — populate `todos` via `extractTodos`; guard with try/catch
  (§3.4).

Protocol (extend the already-dirty files):

- `packages/data/protocol/src/protocol/agent.launch.ts`
- `packages/data/protocol/src/protocol/agent.message.ts`
  — add an optional `sourceDocumentId?: string` field. Populated by
  `DocumentEditorPage` when the launch/message originates from the
  document editor; consumed by the handlers (§4.4) to drive auto-
  attach.

Provider rendering:

- `packages/service/pebble/src/providers/providers/anthropic/render-text-cell.ts`
- `packages/service/pebble/src/providers/providers/ollama/render-text-cell.ts`
- `packages/service/pebble/src/providers/providers/openai/open-aiprovider.ts`
- `packages/service/pebble/src/providers/providers/openrouter/open-router-provider.ts`
  — render the `<open-tasks>` block when a `documentReference` cell
  carries todos *and* the active agent has `progressive-task-list`
  bound to the same `documentId` (§3.5 rules 1 + 2). May require
  threading the agent's capability set into the render-cell signature
  if it isn't already.

Capability:

- `packages/service/pebble/src/capabilities/progressive-task-list/progressive-task-list-capability.ts`
  — accept optional `documentId` param; in `hookBeforeAgentTurn`,
  seed `tasks` slot from `extractTodos` when bound; mirror tool
  side-effects via `applyTodoStatus`.
- `packages/service/pebble/src/capabilities/progressive-task-list/tools/mark-task-complete/handler.ts`
- `packages/service/pebble/src/capabilities/progressive-task-list/tools/mark-task-invalid/handler.ts`
  — call `applyTodoStatus` + document runner persist when capability
  has a `documentId`; return typed error on unknown id.
- `packages/service/pebble/src/capabilities/capability-registry.ts`
  — forward `documentId` param into the constructor when the
  capability config carries one.

Handlers:

- `packages/service/daemon/src/handlers/agent.launch.handler.ts`
  — when `sourceDocumentId` is present, seed the launched agent's
  `progressive-task-list` capability config with that `documentId`
  (§4.4 fresh-launch path).
- `packages/service/daemon/src/handlers/agent.message.handler.ts`
  — apply the §4.4 conflict matrix; return a structured warning to
  the UI when the bound doc doesn't match `sourceDocumentId`.

---

## Implementation order

1. **Phase 1.1–1.3** — Land the node and its commands behind the
   document editor only. Toolbar button. No daemon work. Shippable on
   its own: humans can use todos in documents immediately.
2. **Phase 2** — `/task` slash command + the slash primitive
   refactor. Still UI-only.
3. **Phase 3** — Resolver extracts todos and renders them in the
   prompt. Read-only for the agent.
4. **Phase 4** — Extend `progressive-task-list` to mutate document
   state. End-to-end loop is live.
5. **Phase 5** — Polish.

Each phase is independently shippable.

---

## Open questions

1. **`progressive-task-list` reuse vs new capability.** The existing
   capability dedupes by `tasks` state slot keyed off a single agent's
   lifecycle. Seeding it from a document means every turn we may
   *replace* the seed if the human edited the doc out of band.
   Acceptable, but it slightly bends the "agent owns its task list"
   model. If you prefer hard separation, fork to a new
   `DocumentTaskListCapability` (matches the prior plan) — the cost
   is duplicating ~150 LOC of trace-emission boilerplate.

2. **Stale todo ids.** A user can delete a `todoItem` then re-type the
   same text — new ULID. The agent may then call
   `mark-task-complete` with a now-defunct id. v1 returns a typed
   error from the tool; a future iteration could fuzzy-match by text.

3. ~~**Multiple documents per agent.**~~ **Decided in §4.4 — reject
   mid-life rebind.** The capability's `documentId` is immutable for
   the agent's lifetime. The document editor defaults to launching a
   fresh agent per document session; "send to existing agent" still
   works but treats tasks as read-only when the bound doc does not
   match. Widening to a set of document ids is a future-phase change
   (re-key `tasks` slot by `(documentId, todoId)`, add `documentId`
   to tool schemas, group traces in the UI) — deferred until product
   demand. Flag if you want the silent-reset behaviour instead.

4. **Markdown ingestion.** GFM `- [ ]` from pasted or imported
   markdown stays as bullet lists in v1. Onboarding copy in the
   document editor should mention this.

5. **Slash trigger refactor blast radius.** Phase 2.1 lifts code out
   of `rich-message-composer/`. Worth a follow-up grep for any other
   call sites we'd break. If the lift is too invasive, the smaller
   alternative is to duplicate the `/task`-specific subset directly
   inside the document editor.

6. **Sub-agent inheritance.** If a parent agent has the document-
   scoped `progressive-task-list` and spawns a sub-agent via
   `SubAgentCapability`, should the child inherit it with the same
   `documentId`? Defaulting to yes seems right (the sub-agent is
   working on the same document) but verify with the sub-agent
   lifecycle code currently in flux (`packages/service/daemon/src/
   services/agent-registry-service.ts`, recent commits `5fab29a`,
   `3fc39f7`).
