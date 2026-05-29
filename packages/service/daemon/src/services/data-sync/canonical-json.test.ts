import { describe, expect, test } from 'bun:test';
import { canonicalJSON, contentHashOf } from './canonical-json';

describe('feature: canonicalJSON', () => {
  test('key-order: differently ordered objects serialize identically', () => {
    const left = { b: 1, a: 2, nested: { y: 1, x: 2 } };
    const right = { nested: { x: 2, y: 1 }, a: 2, b: 1 };
    expect(canonicalJSON(left)).toBe(canonicalJSON(right));
  });

  test('arrays: element order is preserved', () => {
    expect(canonicalJSON([3, 1, 2])).toBe('[3,1,2]');
  });

  test('hash: same fields in different key order hash the same', () => {
    const left = { content: { type: 'doc', content: [] }, name: 'A' };
    const right = { name: 'A', content: { content: [], type: 'doc' } };
    expect(contentHashOf(left)).toBe(contentHashOf(right));
  });

  test('hash: differing values produce different hashes', () => {
    expect(contentHashOf({ a: 1 })).not.toBe(contentHashOf({ a: 2 }));
  });
});
