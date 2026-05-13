import { describe, expect, mock, test } from 'bun:test';

describe('feature: focused test cases', () => {
  test('happy: passes', () => {
    const fn = mock(() => true);
    expect(fn()).toBe(true);
  });
});
