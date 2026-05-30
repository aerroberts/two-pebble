# @two-pebble/cli

`peb` is the Two Pebble command-line client. It talks to the local daemon over
the protocol WebSocket to manage TipTap-backed documents, call tools, and run
the daemon itself. It is built with [commander](https://github.com/tj/commander.js)
and ships as the `peb` binary.

Use this package from a terminal once the daemon is reachable.

## Build & link

```bash
bun run --cwd packages/service/cli build
bun run --cwd packages/service/cli link   # exposes the `peb` binary
```

## Commands

```bash
peb daemon run              # start the local daemon
peb document list           # list documents
peb document read --id <id> # print a document
peb call-tool --name <tool> # invoke a registered tool
```

## Adding a command

Commands are registered against the shared `commander` program. A command file
wires its subcommands and actions:

```ts
import type { Command } from 'commander';

export function registerExampleCommand(program: Command): void {
  program
    .command('example')
    .description('An example subcommand.')
    .option('--id <id>', 'target id')
    .action(async (options: { id: string }) => {
      console.log(`running example for ${options.id}`);
    });
}
```
