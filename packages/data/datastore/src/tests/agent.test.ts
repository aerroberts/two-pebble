import { describe, expect, test } from 'bun:test';
import { firstAgentInput, secondAgentInput } from '../testing/datastore-test-constants';
import { useDatastoreForTesting } from '../testing/datastore-test-env';

describe('feature: operation agent.list', () => {
  test('happy: lists recorded agents', async () => {
    const datastore = await useDatastoreForTesting();
    await datastore.agent.create({
      description: 'List test agent',
      name: 'List Agent',
      projectId: 'proj_default',
      workspaceId: 'legacy',
    });
    const list = await datastore.agent.list({ limit: 50, offset: 0 });
    await datastore.close();
    expect(list.items).toHaveLength(1);
  });
});

describe('feature: operation agent.read', () => {
  test('happy: reads an agent by id', async () => {
    const datastore = await useDatastoreForTesting();
    const agent = await datastore.agent.create({
      description: 'Read test agent',
      name: 'Read Agent',
      projectId: 'proj_default',
      workspaceId: 'legacy',
    });
    const read = await datastore.agent.read({ id: agent.id });
    await datastore.close();
    expect(read.name).toBe('Read Agent');
  });
});

describe('feature: operation agent.rename', () => {
  test('happy: renames an agent by id', async () => {
    const datastore = await useDatastoreForTesting();
    const agent = await datastore.agent.create(firstAgentInput);
    const renamed = await datastore.agent.rename({ id: agent.id, name: 'Renamed Agent' });
    await datastore.close();
    expect(renamed.name).toBe('Renamed Agent');
  });
});

describe('feature: operation agent.create', () => {
  test('happy: creates an idle agent', async () => {
    const datastore = await useDatastoreForTesting();
    const agent = await datastore.agent.create({
      description: 'Create test agent',
      name: 'Create Agent',
      projectId: 'proj_default',
      workspaceId: 'legacy',
    });
    await datastore.close();
    expect(agent.status).toBe('idle');
  });

  test('happy: creates datastore owned ids', async () => {
    const datastore = await useDatastoreForTesting();
    const first = await datastore.agent.create(firstAgentInput);
    const second = await datastore.agent.create(secondAgentInput);
    await datastore.close();
    expect(first.id.startsWith('agents:')).toBe(true);
    expect(second.id).not.toBe(first.id);
  });

  test('happy: creates child agents with a parent agent id', async () => {
    const datastore = await useDatastoreForTesting();
    const parent = await datastore.agent.create(firstAgentInput);
    const child = await datastore.agent.create({ ...secondAgentInput, parentAgentId: parent.id });
    const read = await datastore.agent.read({ id: child.id });
    await datastore.close();
    expect(read.parentAgentId).toBe(parent.id);
  });
});

describe('feature: operation agent.complete', () => {
  test('happy: marks an idle agent offline', async () => {
    const datastore = await useDatastoreForTesting();
    const agent = await datastore.agent.create({
      description: 'Complete test agent',
      name: 'Complete Agent',
      projectId: 'proj_default',
      workspaceId: 'legacy',
    });
    const completed = await datastore.agent.complete({ id: agent.id });
    await datastore.close();
    expect(completed.status).toBe('offline');
  });
});

describe('feature: operation agent.fail', () => {
  test('happy: marks an agent failed', async () => {
    const datastore = await useDatastoreForTesting();
    const agent = await datastore.agent.create({
      description: 'Fail test agent',
      name: 'Fail Agent',
      projectId: 'proj_default',
      workspaceId: 'legacy',
    });
    const failed = await datastore.agent.fail({ id: agent.id });
    await datastore.close();
    expect(failed.status).toBe('failed');
  });
});

describe('feature: operation agent.set-status', () => {
  test('happy: setStatus moves an agent to running and back', async () => {
    const datastore = await useDatastoreForTesting();
    const agent = await datastore.agent.create({
      description: 'set status agent',
      name: 'Set Status',
      projectId: 'proj_default',
      workspaceId: 'legacy',
    });
    const running = await datastore.agent.setStatus({ id: agent.id, status: 'running' });
    await datastore.close();
    expect(running.status).toBe('running');
  });

  test('happy: setStatus marks an agent interrupted', async () => {
    const datastore = await useDatastoreForTesting();
    const agent = await datastore.agent.create({
      description: 'interrupted status agent',
      name: 'Interrupted Status',
      projectId: 'proj_default',
      workspaceId: 'legacy',
    });
    const interrupted = await datastore.agent.setStatus({ id: agent.id, status: 'interrupted' });
    await datastore.close();
    expect(interrupted.status).toBe('interrupted');
  });
});

describe('feature: operation agent.set-metadata', () => {
  test('happy: persists framework metadata blob', async () => {
    const datastore = await useDatastoreForTesting();
    const agent = await datastore.agent.create(firstAgentInput);
    const updated = await datastore.agent.setMetadata({ id: agent.id, metadata: '{"sessionId":"s1"}' });
    const read = await datastore.agent.read({ id: agent.id });
    await datastore.close();
    expect(agent.metadata).toBe('{}');
    expect(updated.metadata).toBe('{"sessionId":"s1"}');
    expect(read.metadata).toBe('{"sessionId":"s1"}');
  });
});

describe('feature: operation agent.set-parent-response-signal-id', () => {
  test('happy: stores the parent response signal id', async () => {
    const datastore = await useDatastoreForTesting();
    const agent = await datastore.agent.create(firstAgentInput);
    const updated = await datastore.agent.setParentResponseSignalId({ id: agent.id, parentResponseSignalId: 's1' });
    await datastore.close();
    expect(updated.parentResponseSignalId).toBe('s1');
  });
});

describe('feature: agent registry link', () => {
  test('happy: persists agent registry id when provided', async () => {
    const datastore = await useDatastoreForTesting();
    const agent = await datastore.agent.create({
      agentRegistryId: 'registry-1',
      description: 'registry-linked agent',
      name: 'Registry Agent',
      projectId: 'proj_default',
      workspaceId: 'legacy',
    });
    const read = await datastore.agent.read({ id: agent.id });
    await datastore.close();
    expect(read.agentRegistryId).toBe('registry-1');
  });

  test('happy: leaves agent registry id null when omitted', async () => {
    const datastore = await useDatastoreForTesting();
    const agent = await datastore.agent.create({
      description: 'pre-resume agent',
      name: 'Legacy Agent',
      projectId: 'proj_default',
      workspaceId: 'legacy',
    });
    const read = await datastore.agent.read({ id: agent.id });
    await datastore.close();
    expect(read.agentRegistryId).toBeNull();
    expect(agent.agentRegistryId).toBeNull();
  });
});
