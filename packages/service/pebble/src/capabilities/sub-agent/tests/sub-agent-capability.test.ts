import { describe, it } from 'bun:test';
import {
  expectSendRejectsTerminalTask,
  expectSendToFrameworkChildUsesSubAgentSend,
  expectSpawnRegistersNewToolSurface,
  expectSpawnSendsTaskInstructions,
  expectSpawnUsesRequestedWorkspaceMode,
  expectTeammateFollowUpUsesChildSignal,
  expectWaitRegistersFanInSignal,
} from './sub-agent-capability.test-env';

describe('feature: sub-agent capability registration', () => {
  it('happy: exposes spawn, send, wait, and kill tools', () => {
    expectSpawnRegistersNewToolSurface();
  });

  it('happy: spawn launches a named task child and sends initial instructions', async () => {
    await expectSpawnSendsTaskInstructions();
  });

  it('happy: spawn forwards the requested workspace mode', async () => {
    await expectSpawnUsesRequestedWorkspaceMode();
  });

  it('happy: wait registers a fan-in signal for unresolved children', async () => {
    await expectWaitRegistersFanInSignal();
  });

  it('happy: teammate follow-up resolves the child response signal', async () => {
    await expectTeammateFollowUpUsesChildSignal();
  });

  it('happy: framework child follow-up sends a normal child message', async () => {
    await expectSendToFrameworkChildUsesSubAgentSend();
  });

  it('unhappy: send rejects terminal task children', async () => {
    await expectSendRejectsTerminalTask();
  });
});
