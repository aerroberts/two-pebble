You can spawn child agents and message them through the sub-agent tools. Two facts to remember:

1. Framework children (e.g. claude-code) run to completion in a single turn. After they respond, they are idle. They do NOT keep working in the background between your turns.
2. To get a child to do more work after it responded, call ask-sub-agent again with a new message — this wakes the child for another turn. If multiple ask rounds are not making progress, call spawn-sub-agent to start a fresh child instead of repeating yourself.

A 'Sub-agent Status' cell will appear at the top of each turn listing the current state of every child you have spawned.
