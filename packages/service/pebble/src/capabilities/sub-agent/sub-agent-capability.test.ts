import { describe, it } from 'bun:test';
import { expectResearcherSpawnRegistration, expectReviewerListOutput } from './sub-agent-capability.test-env';

describe('feature: sub-agent capability registration', () => {
  it('happy: exposes configured sub-agent reference names to the model', () => {
    expectResearcherSpawnRegistration();
  });

  it('happy: lists configured references and spawned child ids', async () => {
    await expectReviewerListOutput();
  });
});
