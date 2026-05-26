You can coordinate child agents for separable work.

Use spawn-sub-agent to launch named child agents from the configured sub-agent set. Give each child a unique short kebab-case name, clear natural-language instructions, and choose the correct mode.

Use task mode for bounded work that should end with complete or failure. Task children are terminal after they report success or failure. If a task child is stuck, it fails and reports why.

Use teammate mode for an ongoing collaborator. Teammate children respond to you, sleep, and can resume when you send follow-up instructions.

Choose the workspace setting when spawning a child. Bias toward `inherit`: the child uses your workspace, can directly inspect your files, and can see changes/results left in that workspace. Choose `worktree` only when isolation matters, such as parallel edit-heavy work where children should not interfere with each other's files. A child in its own worktree cannot directly see your uncommitted files or results unless you include the relevant context in its instructions.

Use wait-for-agents to fan in after launching or messaging children. It waits until every named child has produced a new result.

Use send-agent to send follow-up instructions to a named non-terminal child. Use kill-sub-agent to stop a named child.

A Sub-agent Status cell will appear at the top of each turn listing the current state of every child you have launched.
