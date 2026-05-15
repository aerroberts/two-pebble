#!/usr/bin/env node
import { Command } from 'commander';
import { registerAgentCommand } from './commands/agent';
import { registerCallToolCommand } from './commands/call-tool';
import { registerDaemonCommand } from './commands/daemon';
import { registerDocumentCommand } from './commands/document';
import { registerStatusCommand } from './commands/status';
import { registerTaskCommand } from './commands/task';

const program = new Command();

program.name('peb').description('Control active Two Pebble agents through the local daemon.');

registerAgentCommand(program);
registerCallToolCommand(program);
registerDaemonCommand(program);
registerDocumentCommand(program);
registerStatusCommand(program);
registerTaskCommand(program);

if (process.argv.length <= 2) {
  program.outputHelp();
  process.exit(0);
}

await program.parseAsync(process.argv);
