import { describe, expect, it } from 'bun:test';
import {
  buildTurnCounterCapabilityFresh,
  buildTurnCounterCapabilityRehydrated,
} from './turn-counter-capability.test-env';

describe('feature: agent capability useState fresh path', () => {
  it('happy: capability seeds initial state through initialize(config)', () => {
    const { capability, snapshots } = buildTurnCounterCapabilityFresh({ start: 5 });
    expect(capability.read()).toBe(5);
    expect(snapshots).toEqual([{ capabilityId: 'turn-counter', name: 'count', value: 5 }]);
  });

  it('happy: set() emits a state-snapshot trace per write', () => {
    const { capability, snapshots } = buildTurnCounterCapabilityFresh({ start: 0 });
    capability.bump();
    capability.bump();
    expect(snapshots.map((entry) => entry.value)).toEqual([0, 1, 2]);
  });
});

describe('feature: agent capability rehydrate path', () => {
  it('happy: restoreSlots replaces slot value and skips initialize', () => {
    const { capability, snapshots } = buildTurnCounterCapabilityRehydrated({ count: 42 });
    expect(capability.read()).toBe(42);
    expect(snapshots).toEqual([]);
  });

  it('happy: subsequent set() after rehydrate emits a new snapshot', () => {
    const { capability, snapshots } = buildTurnCounterCapabilityRehydrated({ count: 10 });
    capability.bump();
    expect(capability.read()).toBe(11);
    expect(snapshots[0]).toEqual({ capabilityId: 'turn-counter', name: 'count', value: 11 });
  });
});
