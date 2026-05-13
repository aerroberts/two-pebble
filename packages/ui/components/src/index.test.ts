import { describe, expect, test } from 'bun:test';
import { Button, HeaderLayout, Placeholder, TwoPebbleLogo } from './index';

describe('feature: components public surface', () => {
  test('happy: exports mirrored reference primitives and Two Pebble branding', () => {
    expect({ Button, HeaderLayout, Placeholder, TwoPebbleLogo }).toEqual({
      Button: expect.any(Function),
      HeaderLayout: expect.any(Function),
      Placeholder: expect.any(Function),
      TwoPebbleLogo: expect.any(Function),
    });
  });
});
