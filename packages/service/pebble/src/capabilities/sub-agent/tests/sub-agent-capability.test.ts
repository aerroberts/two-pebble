import { describe, it } from 'bun:test';
import {
  expectAskNormalizesChildId,
  expectParentResponseContinuesAwaitedChildAsk,
  expectResearcherSpawnRegistration,
  expectReviewerListOutput,
  expectSpawnUsesAwaitedSignal,
} from './sub-agent-capability.test-env';

describe('feature: sub-agent capability registration', () => {
  it('happy: exposes configured sub-agent reference names to the model', () => {
    expectResearcherSpawnRegistration();
  });

  it('happy: lists configured references and spawned child ids', async () => {
    await expectReviewerListOutput();
  });

  it('happy: spawn asks the child through an awaited signal', async () => {
    await expectSpawnUsesAwaitedSignal();
  });

  it('happy: ask accepts a child id without the agents prefix', async () => {
    await expectAskNormalizesChildId();
  });

  it('happy: parent response keeps waiting for child follow-up after a child asks back', async () => {
    await expectParentResponseContinuesAwaitedChildAsk();
  });
});
