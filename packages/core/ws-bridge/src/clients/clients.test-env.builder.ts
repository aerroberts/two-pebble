import { expect } from 'bun:test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { BridgePayload, BridgePayloadObject, BridgeProtocol, Message, WsBridgeWireMessage } from '../protocol';
import { WsBridgeClient } from './ws-bridge-client';
import { WsBridgeServer } from './ws-bridge-server';

export interface PingValue extends BridgePayloadObject {
  value: number;
}

export interface ClientConnectedLifecycleEntry extends BridgePayloadObject {
  type: 'connect';
}

export interface ClientDisconnectedLifecycleEntry extends BridgePayloadObject {
  type: 'disconnect';
}

export interface ClientConversationLifecycleEntry extends BridgePayloadObject {
  receivedClientAnnouncement: string;
  result: PingValue;
  serverAnnouncement: string;
}

export type ClientLifecycleEntry =
  | ClientConnectedLifecycleEntry
  | ClientConversationLifecycleEntry
  | ClientDisconnectedLifecycleEntry;

export interface ClientProtocol
  extends BridgeProtocol<
    {
      operations: [
        { name: 'ping'; request: PingValue; response: PingValue },
        { name: 'explode'; request: PingValue; response: PingValue },
      ];
      events: [{ name: 'client-announcement'; payload: string }];
    },
    { operations: []; events: [{ name: 'announce'; payload: string }] }
  > {}

export interface ServerProtocol
  extends BridgeProtocol<
    { operations: []; events: [{ name: 'announce'; payload: string }] },
    {
      operations: [
        { name: 'ping'; request: PingValue; response: PingValue },
        { name: 'explode'; request: PingValue; response: PingValue },
      ];
      events: [{ name: 'client-announcement'; payload: string }];
    }
  > {}

export function wsClientServerTestEnv() {
  const wire: WsBridgeWireMessage[] = [];
  const lifecycle: ClientLifecycleEntry[] = [];
  const clientAnnouncement = deferred<string>();
  const server = new WsBridgeServer<ServerProtocol>({
    captureWireMessage(message) {
      wire.push(message);
    },
    hostname: '127.0.0.1',
    port: 0,
  });

  return {
    lifecycle,
    server,
    async launch() {
      await server.launch();
      return this;
    },
    client() {
      return new WsBridgeClient<ClientProtocol>({
        captureWireMessage(message) {
          wire.push(message);
        },
        url: `ws://${server.hostname}:${server.port}`,
      });
    },
    onConnected() {
      server.onClientConnected((bridge) => {
        lifecycle.push({ type: 'connect' });
        bridge.emit('announce', 'server-ready');
        bridge.on('ping', async (payload) => ({ value: payload.value + 1 }));
        bridge.listen('client-announcement', (payload) => clientAnnouncement.resolve(payload));
      });
      server.onClientDisconnected(() => {
        lifecycle.push({ type: 'disconnect' });
      });
    },
    async clientAnnouncement() {
      return clientAnnouncement.promise;
    },
    async connectClient(client: WsBridgeClient<ClientProtocol>) {
      return new Promise<string>((resolve) => {
        void client.connect((bridge) => {
          bridge.listen('announce', (payload) => resolve(payload));
        });
      });
    },
    recordLifecycle(result: PingValue, serverAnnouncement: string, receivedClientAnnouncement: string) {
      lifecycle.push({ result, serverAnnouncement, receivedClientAnnouncement });
    },
    async runConversation() {
      this.onConnected();
      const client = this.client();

      try {
        const serverAnnouncement = await this.connectClient(client);
        const result = await client.do('ping', { value: 9 });
        client.emit('client-announcement', 'client-ready');
        const receivedClientAnnouncement = await this.clientAnnouncement();
        this.recordLifecycle(result, serverAnnouncement, receivedClientAnnouncement);
        return { receivedClientAnnouncement, result, serverAnnouncement };
      } finally {
        client.close();
        await waitForDisconnect(lifecycle);
        server.close();
      }
    },
    async runMissingOperation() {
      const client = this.client();

      try {
        await client.connect(() => {});
        await client.do('explode', { value: 9 });
      } finally {
        client.close();
        server.close();
      }
    },
    normalizedWire() {
      return normalizeWireMessages(wire);
    },
  };
}

export function healthServerTestEnv() {
  const server = new WsBridgeServer<ServerProtocol>({
    hostname: '127.0.0.1',
    port: 0,
    fetch(request) {
      const url = new URL(request.url);
      if (url.pathname === '/health') {
        return Response.json({ state: 'ready' });
      }
      return undefined;
    },
  });

  return {
    async rows() {
      await server.launch();
      try {
        const response = await fetch(`http://${server.hostname}:${server.port}/health`);
        const body = (await response.json()) as BridgePayload;
        return [{ body, status: response.status }];
      } finally {
        server.close();
      }
    },
  };
}

export async function expectJsonlSnapshot(name: string, rows: BridgePayload[]) {
  const snapshotPath = resolve(import.meta.dirname, 'snapshots', name);
  const content = `${rows.map((row) => JSON.stringify(row)).join('\n')}\n`;

  if (shouldUpdateSnapshot() || !(await Bun.file(snapshotPath).exists())) {
    mkdirSync(dirname(snapshotPath), { recursive: true });
    writeFileSync(snapshotPath, content);
  }

  expect(await Bun.file(snapshotPath).text()).toBe(content);
}

export async function waitForDisconnect(lifecycle: ClientLifecycleEntry[]) {
  const startedAt = Date.now();
  while (!lifecycle.some((entry) => isLifecycleEntry(entry, 'disconnect'))) {
    if (Date.now() - startedAt > 1000) {
      throw new Error('Timed out waiting for assertion.');
    }
    await Bun.sleep(10);
  }
}

function normalizeWireMessages(messages: WsBridgeWireMessage[]) {
  const ids = new Map<string, string>();

  return messages.map((message) => {
    const parsed = JSON.parse(message.raw) as Message;
    const normalized = normalizeMessage(parsed, ids);

    return {
      direction: message.direction,
      endpoint: message.endpoint,
      message: normalized,
      raw: JSON.stringify(normalized),
    };
  });
}

function normalizeMessage(message: Message, ids: Map<string, string>) {
  const id = ids.get(message.id) ?? `message-${ids.size + 1}`;
  ids.set(message.id, id);

  return {
    ...message,
    id,
  };
}

function shouldUpdateSnapshot() {
  return process.argv.includes('--update-snapshots') || process.env.UPDATE_SNAPSHOTS === '1';
}

function isLifecycleEntry(entry: ClientLifecycleEntry, type: string) {
  return entry.type === type;
}

function deferred<T>() {
  let resolve: (value: T) => void = () => {};
  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve;
  });
  return { promise, resolve };
}
