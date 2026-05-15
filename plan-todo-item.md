# Plan: Custom TipTap Todo Item Component

## Context

Two TipTap surfaces exist in the repo today:

- **`TipTapEditor`** (`packages/ui/components/src/components/editor/tiptap-editor.tsx`) —
  the editable document surface used by `DocumentEditorPage`
  (`packages/ui/app/src/pages/documents/document-editor.page.tsx:39`).
  Extensions are limited to `StarterKit + Link + Image + Placeholder`.
- **`RichMessageComposer`**
  (`packages/ui/components/src/components/input/rich-message-composer/rich-message-composer.tsx`) —
  the chat input. Registers `StarterKit + Placeholder + DocumentMentionNode`
  (lines 82–87), and converts its JSON tree to `CellContent[]` via
  `tipTapDocToCells` (`tiptap-doc-to-cells.ts:20`).

Documents are persisted as TipTap JSON (not markdown or HTML); see
`packages/data/datatypes/src/document-content.ts:54` for the
`markdownToTipTap` / `tipTapToMarkdown` bridge. The wire format from UI to
daemon is a `CellContent[]`. Document references are re-resolved daemon-side
by `resolveDocumentReferenceCells`
(`packages/service/daemon/src/handlers/resolve-document-reference-cells.ts:17`),
which is called from both `agent.message.handler.ts` and
`agent.launch.handler.ts`.

The capability system already has the right shape for a progressive task
list:
`ProgressiveTaskListCapability`
(`packages/service/pebble/src/capabilities/progressive-task-list/progressive-task-list-capability.ts:28`)
emits `task-list-update` traces
(`packages/service/pebble/src/traces/agent-traces/task-list-update.ts`),
backed by tools registered through `hookOnRegister`. Capabilities are
registered via `CapabilityRegistry.newCapability`
(`packages/service/pebble/src/capabilities/capability-registry.ts:23`)
with ids listed in
`packages/service/pebble/src/capabilities/capability-ids.ts`.

The only slash command today is `/doc`, implemented via
`readActiveSlashTrigger` (`slash-trigger.ts:16`) and `SlashDocumentPopover`.
There is no generic command dispatcher — the trigger pipeline assumes
"document mention only."

> **Scope statement.** This plan adds (a) a first-class todo block node to
> the TipTap document surface, (b) a `/task` slash command in the chat
> composer that produces the same node, (c) a daemon path that surfaces
> in-document todos to the agent at submission time, and (d) a capability
> that lets the agent flip todo status, with edits flowing back into the
> document. Nothing in the existing `progressive-task-list` capability is
> replaced — the new capability is document-scoped and produces traces
> already understood by `task-list-update.tsx`.

---

## Phase 1 — TipTap node: `TodoItemNode`

### 1.1 New node module

Create `packages/ui/components/src/components/editor/todo-item-node.ts`
(shared so both `TipTapEditor` and `RichMessageComposer` can register it).
Pattern: `Node.create()` like `DocumentMentionNode`
(`packages/ui/components/src/components/input/rich-message-composer/document-mention-node.ts:15`).

Shape:

- `name: 'todoItem'`
- `group: 'block'` (todos render as block-level checkbox rows; inline use is
  out of scope for v1)
- `content: 'inline*'` — body text is editable inline
- `defining: true` — Enter should split into a sibling todo
- `addAttributes`:
  - `id` — stable, lowercase ULID generated at insertion time (used by the
    daemon + capability to identify the todo across edits)
  - `status` — `'pending' | 'open' | 'completed' | 'invalid'`, default
    `'open'`. Mirrors `TaskListUpdateStatus` from
    `packages/service/pebble/src/traces/agent-traces/task-list-update.ts:1`
    so trace mapping stays trivial.
  - `assignedAgentId` — optional, set when an agent owns the todo
  - `completionType` — optional `'manual' | 'automatic'` (parallels the
    trace type)
- `parseHTML`: `li[data-todo-id]`
- `renderHTML`: `<li>` with `data-todo-id`, `data-todo-status`,
  `contenteditable="true"` on body but `contenteditable="false"` on the
  leading checkbox.

A React node view (`addNodeView` + `ReactNodeViewRenderer` from
`@tiptap/react`) renders the actual checkbox using the existing
`Checkbox` component
(`packages/ui/components/src/components/input/checkbox/checkbox.tsx`).
Toggling the checkbox calls `editor.commands.updateAttributes('todoItem',
{ status: 'completed' | 'open' })`. The id must not regenerate on toggle.

### 1.2 Commands

Extend the node with:

- `addCommands`:
  - `insertTodoItem({ text? })` — inserts a fresh `todoItem` with a new id
  - `toggleTodoItem()` — flips status of the todo containing the selection
- `addKeyboardShortcuts`:
  - `Mod-Enter` — toggle status of current todo
  - `Enter` inside an empty todo → split out as a paragraph (Notion-style
    exit)

### 1.3 Register on both editors

- `TipTapEditor` (`tiptap-editor.tsx:20-25`): add `TodoItemNode` to the
  `extensions` array.
- `RichMessageComposer` (`rich-message-composer.tsx:83-87`): add
  `TodoItemNode`. Composer usage is gated to the `/task` flow (Phase 4),
  but the extension must be registered for the node to parse on paste /
  load from draft storage.

### 1.4 Markdown round-trip

`tipTapDocToMarkdown` (used for legacy logging and voice flows) lives at
`packages/ui/components/src/components/input/rich-message-composer/tiptap-doc-to-markdown.ts`.
A new todo block must serialize as `- [ ]` / `- [x]` GFM tasklist items.
`markdownToTipTap` / `tipTapToMarkdown` in
`packages/data/datatypes/src/document-content.ts:54` use the
`prosemirror-markdown` defaults — those don't know `todoItem`. Add a
custom token at both the parser and serializer level (or, simpler v1, fall
back to `- [ ]` text rendering at serialize time and *only* hydrate todos
from TipTap JSON, not from incoming markdown). v1 should take the simpler
path and note the limitation.

### 1.5 Tests

Mirror the existing `tiptap-doc-to-cells.test.ts` fixtures style. Add
fixtures for:

- Single todo with text body
- Multiple todos interleaved with paragraphs
- Toggling status preserves id
- Round-trip through `tipTapDocToMarkdown` (with the v1 limitation
  documented)

---

## Phase 2 — Document-specific behavior

The document editor (`DocumentEditorPage`) already wires `onBlur` to
`state.saveContent(content)` which persists the TipTap JSON. Once
`TodoItemNode` is registered, todos persist automatically — no schema
change to `documents.table` is required because the JSON column stores any
attributes.

What needs to change:

### 2.1 Document content traversal helper

Create
`packages/data/datatypes/src/document-todos.ts` exporting
`extractTodos(doc: TipTapDocument): DocumentTodo[]` where:

```ts
interface DocumentTodo {
  id: string;
  status: 'pending' | 'open' | 'completed' | 'invalid';
  text: string;
  assignedAgentId?: string;
  completionType?: 'manual' | 'automatic';
}
```

The function walks the JSON looking for `node.type === 'todoItem'` and
flattens inline text from `content`. Co-locate a unit test using fixtures
similar to `tiptap-doc-to-cells.test-fixtures.ts`.

### 2.2 In-place mutation

Also export `applyTodoStatus(doc, id, status, completionType?)` that
returns a new TipTap doc with the targeted todo updated. The daemon-side
capability tools (Phase 4) call this and persist the result via the
existing document write path — keeping all todo state inside the document
JSON, with no parallel todo table.

### 2.3 Document editor UI affordances

In `DocumentEditorPage`, add a toolbar button "Add task" (placed near the
existing header actions at
`packages/ui/app/src/pages/documents/document-editor.page.tsx:17`) that
calls `editor.chain().focus().insertTodoItem().run()`. Optional v1
follow-up: a small completed-count badge ("3 of 7") in the header,
computed from `extractTodos`.

---

## Phase 3 — Todo extraction when document sent to agent

Today, `resolveDocumentReferenceCells`
(`packages/service/daemon/src/handlers/resolve-document-reference-cells.ts:17`)
re-fetches the document and rewrites the cell to include `contentSnapshot`
+ `documentUpdatedAt`. The content goes to the agent as raw TipTap JSON
embedded in the document reference cell.

### 3.1 New cell field: `todos`

Extend the `documentReference` cell content
(`packages/service/pebble/src/thread/cells/document-reference.ts` — see
the export aggregated in
`packages/service/pebble/src/thread/cells/cell.ts:4`) to carry a
`todos: DocumentTodo[]` slice. The field is *additive* — existing
consumers ignore it.

### 3.2 Populate in the resolver

In `resolveDocumentReferenceCells`, after the `documents.read`:

```ts
const todos = extractTodos(parseTipTap(row.content));
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

`parseTipTap` is a small helper that JSON-parses the stored content
(documents are stored as strings today; verify against the datastore
schema before merging).

### 3.3 Surface todos to the model

In the framework-specific rendering layer — `render-text-cell.ts` for each
provider (e.g.
`packages/service/pebble/src/providers/providers/anthropic/render-text-cell.ts`,
`...ollama/...`, `...openai/...`, `...openrouter/...`) — when rendering a
documentReference cell, append a structured block:

```
<document name="Plan" id="…">
  …content…
  <open-tasks>
    - id=01J… status=open  "Wire daemon resolver"
    - id=01J… status=open  "Add capability"
  </open-tasks>
</document>
```

This makes the open todos *first-class* in the agent's context window and
gives it stable ids to reference from the capability tools (Phase 4). Skip
completed/invalid todos by default — emit them only if the resolver flag
`includeTerminal` is set.

### 3.4 Tests

Add a daemon-level test alongside the existing
`resolve-document-reference-cells` flow (find the closest test file or
create a new one): document with three todos, two open / one completed →
the resulting cell carries the three todos with correct statuses.

---

## Phase 4 — Capability: `DocumentTaskListCapability`

Model on `ProgressiveTaskListCapability`
(`packages/service/pebble/src/capabilities/progressive-task-list/progressive-task-list-capability.ts:28`)
but document-scoped instead of agent-launch-scoped.

### 4.1 Capability skeleton

Path: `packages/service/pebble/src/capabilities/document-task-list/`.

- `document-task-list-capability.ts`:
  - `id = 'document-task-list'`
  - `params: { documentId: string }` — set when the agent is given the
    document via `/task` flow, parent-link, or explicit registry config.
  - State slots (`this.useState`):
    - `seenTodoIds: string[]` — todos the agent has acknowledged
    - `emittedStatuses: Record<string, TaskStatus>` — same pattern as
      `progressive-task-list-capability.ts:32`, used to dedupe trace
      emission.
  - `hookOnRegister()` returns the tools below.
  - `hookBeforeAgentTurn()`: re-reads the document (via injected
    `DocumentRunner` — the same one used by `DocumentWriterCapability`,
    see `packages/service/pebble/src/capabilities/document-writer/document-writer-capability.ts:122`),
    extracts open todos, and emits a `task-list-update` trace whenever
    statuses diverge from `emittedStatuses`. Existing
    `task-list-update.tsx` UI renders these without changes.

### 4.2 Tools

- `mark-document-task-complete({ todoId, completionReason? })`
- `mark-document-task-invalid({ todoId, reason })`
- `add-document-task({ text, afterTodoId? })` — for agent-driven planning
  inside a document
- `update-document-task-text({ todoId, text })`

Each tool:

1. Reads the document via the runner.
2. Calls `applyTodoStatus` / equivalent mutation from
   `document-todos.ts`.
3. Writes the document back through the runner.
4. Returns `ToolResponse.success` with a short summary cell.

Modeled directly on
`packages/service/pebble/src/capabilities/progressive-task-list/tools/mark-task-complete/handler.ts`
for shape, errors, and zod schemas.

### 4.3 Registration

- Add `'document-task-list'` to
  `packages/service/pebble/src/capabilities/capability-ids.ts`.
- Register in `CapabilityRegistry.newCapability`
  (`capability-registry.ts:23`):
  ```ts
  if (id === 'document-task-list') {
    return new DocumentTaskListCapability() as AgentCapability<PebbleJsonValue>;
  }
  ```
- Update the agent registry UI (the capability picker — find it via
  callers of `knownCapabilityIds`) so users can attach it when defining a
  registry.

### 4.4 Auto-attach on submission

When `/task`-driven cells reach the daemon (Phase 5), the handler should
ensure the launched agent has `document-task-list` enabled (with the
correct `documentId` in its params) even if the registry config didn't
explicitly include it. This avoids a foot-gun where the user invokes
`/task` against an agent that can't actually move task status.

### 4.5 Tests

Use the same harness used by progressive task list tests. Scenarios:

- Tool marks a todo complete → document on disk has updated attrs → trace
  emitted on next turn.
- Two tools called in the same turn → single coalesced trace.
- Tool against unknown id → typed error.

---

## Phase 5 — `/task` slash command in the composer

### 5.1 Generalize the trigger system

`readActiveSlashTrigger` (`slash-trigger.ts:16`) returns
`{ query }` only — the *kind* of command is implicit. Replace with a
dispatcher:

- Add `command: string` to the return value (the leading word — `doc`,
  `task`, …).
- Treat the first whitespace as a boundary: `/task buy milk` →
  `{ command: 'task', argument: 'buy milk' }`.
- Existing `/doc` behavior maps to `command === 'doc'`.

### 5.2 Popover routing

`RichMessageComposer` currently mounts `SlashDocumentPopover`
unconditionally when `slashTrigger !== null`
(`rich-message-composer.tsx:146-155`). Wrap it:

- `command === 'doc'` → existing `SlashDocumentPopover`.
- `command === 'task'` → new `SlashTaskInlinePreview` — a lightweight
  inline hint that says "Press Enter to add task", since unlike `/doc`
  there's nothing to pick from a list. Or, if we want list-of-existing-
  document-todos, render those for selection.
- Unknown command → no popover (graceful no-op).

### 5.3 Replacement command

Add `replaceTriggerWithTodoItem(editor, trigger, { text })` next to
`replaceTriggerWithDocumentMention` (`slash-trigger.ts:48`). Generates a
fresh todo id and inserts via the editor command from Phase 1.2.

### 5.4 Cell conversion

Update `tipTapDocToCells` (`tiptap-doc-to-cells.ts:20`) to handle
`node.type === 'todoItem'`:

```ts
if (node.type === 'todoItem') {
  flushText();
  cells.push(Cell.todoItem({
    id: node.attrs.id,
    text: extractInlineText(node),
    status: node.attrs.status,
  }));
  return;
}
```

Define a new `Cell.todoItem(...)` factory by adding
`packages/service/pebble/src/thread/cells/todo-item.ts` and registering it
in `cell.ts:13-25` and `index.ts`. Keep the cell additive — it's a sibling
of `text` / `documentReference`, not a replacement.

### 5.5 Daemon handling

In `agent.message.handler.ts` and `agent.launch.handler.ts` (both
currently dirty in `git status`), after `resolveDocumentReferenceCells`,
add `materializeTodoItemCells`:

- If the launched agent has `document-task-list` enabled with a
  `documentId`, append each `todoItem` cell as an actual todo node in
  that document (mutating the stored TipTap JSON via the document
  runner).
- Strip the `todoItem` cells from the wire payload after materialization
  (the agent sees them via the document instead, keeping a single source
  of truth).
- If no `documentId` exists on the agent, fall back to including the
  todoItem cells inline so the agent at least sees them as text — and
  log a warning.

### 5.6 UI: composer affordance

Add an "Add task" icon button next to the existing voice / send buttons
in `RichMessageComposer`. Clicking inserts `/task ` to trigger the same
flow as typing. Keep the affordance subtle — the slash command is the
primary path.

### 5.7 Tests

- Fixture: composer doc with two `/task` items + paragraph → cells output
  matches expectations.
- Daemon path: `todoItem` cells against an agent with
  `document-task-list` → document on disk grows the matching nodes; cells
  are stripped from the resolved payload.

---

## Phase 6 — Rollout

1. Land Phase 1 + 2 first (pure UI; safe behind feature use — no
   capability or daemon work yet). Document editor users can start using
   todos immediately; nothing flows to agents.
2. Land Phase 3 (resolver enrichment). Agents see todos in document
   context. Read-only — they can't change them yet.
3. Land Phase 4 (capability). Agents can flip statuses on the documents
   they have access to.
4. Land Phase 5 (`/task` in composer). End-to-end loop is live.

Each phase is shippable; no big-bang merge required.

---

## Open questions

- **Todo identity across edits.** A user could delete a todo node and
  re-type the same text, producing a new id. The agent might then point
  to a stale id. v1 keeps this simple (stale id → "not found" error from
  the tool); a future iteration could match by text fuzzy-match as a
  fallback.
- **Cross-document todo capability.** `DocumentTaskListCapability` is
  single-document. Multi-document agents would need either many
  capability instances or a registry-wide variant. Defer until the
  product asks for it.
- **Markdown ingestion.** GFM tasklists in pasted/imported markdown won't
  hydrate into `todoItem` nodes in v1. Either teach
  `markdownToTipTap` about them or document the limitation in the
  document editor onboarding.
- **Sub-agent inheritance.** When `SubAgentCapability` spawns a child,
  should the child inherit `document-task-list` with the same
  `documentId`? Probably yes by default — wire through
  `packages/service/pebble/src/capabilities/sub-agent/`.
