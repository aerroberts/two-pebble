import fs from 'node:fs';
import type { TwoPebbleDaemon } from '@two-pebble/daemon';
import type { RealtimeDaemonDriver } from './realtime-daemon-driver';
import type { RealtimeHookDriver } from './realtime-hook-driver';
import type { RealtimeTestContextInput } from './types';

/**
 * Owns the real daemon and realtime hook test harness.
 * Each instance uses its own temporary datastore and log file.
 * Closing the context tears down websocket and filesystem state.
 */
export class RealtimeTestContext {
  public readonly daemon: RealtimeDaemonDriver;
  public readonly realtime: RealtimeHookDriver;
  private readonly daemonInstance: TwoPebbleDaemon;
  private readonly directoryPath: string;

  public constructor(input: RealtimeTestContextInput) {
    this.daemon = input.daemon;
    this.daemonInstance = input.daemonInstance;
    this.directoryPath = input.directoryPath;
    this.realtime = input.realtime;
  }

  /**
   * Stops the daemon and removes temporary test files.
   * This should be called at the end of each test.
   * The method is safe to call after hook roots have already unmounted.
   */
  public async close(): Promise<void> {
    await this.daemonInstance.close();
    fs.rmSync(this.directoryPath, { force: true, recursive: true });
  }
}
