import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { TwoPebbleDaemon } from '@two-pebble/daemon';
import { RealtimeDaemonDriver } from './realtime-daemon-driver';
import { RealtimeHookDriver } from './realtime-hook-driver';
import { RealtimeTestContext } from './realtime-test-context';
import type { RealtimeContextBuilderInput } from './types';

export async function buildRealtimeContext(input: RealtimeContextBuilderInput): Promise<RealtimeTestContext> {
  const directoryPath = fs.mkdtempSync(path.join(os.tmpdir(), 'two-pebble-realtime-test-'));
  const daemonInstance = new TwoPebbleDaemon({
    databaseFilePath: path.join(directoryPath, 'test.sqlite'),
    host: '127.0.0.1',
    logFilePath: path.join(directoryPath, input.logFileName ?? 'daemon.log'),
    port: 0,
  });

  await daemonInstance.launch();

  const url = `ws://${daemonInstance.hostname}:${daemonInstance.port}`;
  const daemon = new RealtimeDaemonDriver({ url });
  const realtime = new RealtimeHookDriver({
    daemon,
    url,
  });

  return new RealtimeTestContext({ daemon, daemonInstance, directoryPath, realtime });
}
