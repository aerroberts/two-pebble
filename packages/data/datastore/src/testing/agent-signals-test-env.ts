import type { Datastore } from '../datastore';
import { firstAgentInput } from './datastore-test-constants';

export async function seedAgentSignal(datastore: Datastore) {
  const agent = await datastore.agent.create(firstAgentInput);
  const signal = await datastore.agent.signals.register({
    agentId: agent.id,
    capabilityId: 'sub-agent',
    description: 'Wait for child response.',
    name: 'Sub-agent response',
    signalId: 'signal-1',
  });
  return { agent, signal };
}

export async function seedReceivedAgentSignal(datastore: Datastore) {
  const { agent } = await seedAgentSignal(datastore);
  const received = await datastore.agent.signals.resolve({
    agentId: agent.id,
    capabilityId: 'sub-agent',
    data: { message: 'done' },
    signalId: 'signal-1',
  });
  return { agent, received };
}

export async function seedPushAgentSignal(datastore: Datastore) {
  const agent = await datastore.agent.create(firstAgentInput);
  const signal = await datastore.agent.signals.sendPush({
    agentId: agent.id,
    capabilityId: 'parent-link',
    data: { message: 'hello' },
    description: 'Parent request.',
    name: 'Parent ask',
    signalId: 'push-1',
  });
  return { agent, signal };
}
