import { describe, it } from 'bun:test';
import {
  expectAskParentUsesPendingResponseSignal,
  expectParentAskAddsIncomingMessageTrace,
  expectParentResponseRestoresPendingParentReply,
} from './parent-link-capability.test-env';

describe('feature: parent-link capability signaling', () => {
  it('happy: child asks parent through the pending parent response signal', async () => {
    await expectAskParentUsesPendingResponseSignal();
  });

  it('happy: parent response can restore pending response context', async () => {
    await expectParentResponseRestoresPendingParentReply();
  });

  it('happy: parent asks are traced as incoming parent messages', () => {
    expectParentAskAddsIncomingMessageTrace();
  });
});
