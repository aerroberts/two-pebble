import { describe, expect, test } from 'bun:test';
import {
  claudeCodeInstallCreateInput,
  claudeCodeInstallDeleteInput,
  claudeCodeInstallListInput,
  claudeCodeInstallUpdateCreateInput,
  claudeCodeInstallUpdateInput,
} from '../testing/datastore-test-constants';
import { useDatastoreForTesting } from '../testing/datastore-test-env';

describe('feature: operation third-party-agent-installs.create', () => {
  test('happy: creates an install', async () => {
    const datastore = await useDatastoreForTesting();
    const install = await datastore.thirdPartyAgentInstalls.create(claudeCodeInstallCreateInput);
    await datastore.close();
    expect(install).toMatchObject({
      data: { executablePath: '/usr/local/bin/claude' },
      frameworkId: 'claude-code',
    });
  });
});

describe('feature: operation third-party-agent-installs.delete', () => {
  test('happy: deletes an install', async () => {
    const datastore = await useDatastoreForTesting();
    const install = await datastore.thirdPartyAgentInstalls.create(claudeCodeInstallDeleteInput);
    await datastore.thirdPartyAgentInstalls.delete({ id: install.id });
    const list = await datastore.thirdPartyAgentInstalls.list({ limit: 50, offset: 0 });
    await datastore.close();
    expect(list.items).toHaveLength(0);
  });
});

describe('feature: operation third-party-agent-installs.list', () => {
  test('happy: lists installs', async () => {
    const datastore = await useDatastoreForTesting();
    await datastore.thirdPartyAgentInstalls.create(claudeCodeInstallListInput);
    const list = await datastore.thirdPartyAgentInstalls.list({ limit: 50, offset: 0 });
    await datastore.close();
    expect(list.items).toHaveLength(1);
  });

  test('happy: supports multiple installs for the same framework', async () => {
    const datastore = await useDatastoreForTesting();
    await datastore.thirdPartyAgentInstalls.create(claudeCodeInstallListInput);
    await datastore.thirdPartyAgentInstalls.create(claudeCodeInstallCreateInput);
    const list = await datastore.thirdPartyAgentInstalls.list({ limit: 50, offset: 0 });
    await datastore.close();
    expect(list.items).toHaveLength(2);
  });
});

describe('feature: operation third-party-agent-installs.read', () => {
  test('happy: reads an install', async () => {
    const datastore = await useDatastoreForTesting();
    const created = await datastore.thirdPartyAgentInstalls.create(claudeCodeInstallCreateInput);
    const install = await datastore.thirdPartyAgentInstalls.read({ id: created.id });
    await datastore.close();
    expect(install).toMatchObject({
      data: { executablePath: '/usr/local/bin/claude' },
      frameworkId: 'claude-code',
    });
  });
});

describe('feature: operation third-party-agent-installs.update', () => {
  test('happy: updates install name and data', async () => {
    const datastore = await useDatastoreForTesting();
    const install = await datastore.thirdPartyAgentInstalls.create(claudeCodeInstallUpdateCreateInput);
    const updated = await datastore.thirdPartyAgentInstalls.update({
      id: install.id,
      ...claudeCodeInstallUpdateInput,
    });
    await datastore.close();
    expect(updated.name).toBe('Claude Code New');
    expect(updated.data.executablePath).toBe('/usr/local/bin/claude-new');
  });
});
