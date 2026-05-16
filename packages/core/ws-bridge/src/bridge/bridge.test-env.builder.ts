import { expect } from 'bun:test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { BridgePayload, BridgePayloadObject, BridgeProtocol, Message } from '../protocol';
import { Bridge } from './bridge';

/**
 * Shared payload used by bridge operation test protocols.
 */
export interface PingValue extends BridgePayloadObject {
  value: number;
}

/**
 * Client-side test protocol for in-process bridge assertions.
 */
export interface PingProtocol
  extends BridgeProtocol<
    {
      operations: [
        { name: 'ping'; request: PingValue; response: PingValue },
        { name: 'explode'; request: PingValue; response: PingValue },
      ];
      events: [];
    },
    {
      operations: [];
      events: [{ name: 'announce'; payload: string }];
    }
  > {}

/**
 * Server-side test protocol mirroring the ping protocol in reverse.
 */
export interface PongProtocol
  extends BridgeProtocol<
    {
      operations: [];
      events: [{ name: 'announce'; payload: string }];
    },
    {
      operations: [
        { name: 'ping'; request: PingValue; response: PingValue },
        { name: 'explode'; request: PingValue; response: PingValue },
      ];
      events: [];
    }
  > {}

/**
 * Builds an in-memory bridge pair used by bridge unit tests.
 */
export function bridgeTestEnv() {
  const messages: Message[] = [];
  const client = new Bridge<PingProtocol>();
  const server = new Bridge<PongProtocol>();

  return {
    client,
    server,
    connect() {
      client.onSendMessage((message) => {
        messages.push(message);
        void server.receiveMessage(message);
      });
      server.onSendMessage((message) => {
        messages.push(message);
        void client.receiveMessage(message);
      });
      return this;
    },
    captureServerOnly() {
      server.onSendMessage((message) => {
        messages.push(message);
      });
      return this;
    },
    onPing() {
      server.on('ping', async (payload) => ({ value: payload.value + 1 }));
      return this;
    },
    onExplode() {
      server.on('explode', async () => {
        throw new Error('operation failed on purpose');
      });
      return this;
    },
    async announce() {
      return new Promise<string>((resolve) => {
        client.listen('announce', (payload) => resolve(payload));
        server.emit('announce', 'hello');
      });
    },
    unlistenResult() {
      const received: string[] = [];
      const unlisten = client.listen('announce', (payload) => received.push(payload));
      server.emit('announce', 'before');
      unlisten();
      server.emit('announce', 'after');
      return received;
    },
    normalizedMessages() {
      return messages.map((message, index) => ({
        ...message,
        id: `message-${index + 1}`,
      }));
    },
  };
}

/**
 * Writes or checks a JSONL snapshot for deterministic bridge messages.
 */
export async function expectJsonlSnapshot(name: string, rows: BridgePayload[]) {
  const snapshotPath = resolve(import.meta.dirname, 'snapshots', name);
  const content = `${rows.map((row) => JSON.stringify(row)).join('\n')}\n`;

  if (shouldUpdateSnapshot() || !(await Bun.file(snapshotPath).exists())) {
    mkdirSync(dirname(snapshotPath), { recursive: true });
    writeFileSync(snapshotPath, content);
  }

  expect(await Bun.file(snapshotPath).text()).toBe(content);
}

function shouldUpdateSnapshot() {
  return process.argv.includes('--update-snapshots') || process.env.UPDATE_SNAPSHOTS === '1';
}
