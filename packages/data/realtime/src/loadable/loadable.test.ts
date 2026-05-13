import { describe, expect, test } from 'bun:test';
import { Loadable } from './loadable';

describe('feature: loadable state', () => {
  test('happy: returns a new instance when status changes', () => {
    const readyText = new Loadable<string>({ status: 'ready', value: 'alpha' });
    const next = readyText.withStatus('loading');
    expect(next).not.toBe(readyText);
    expect(next.status).toBe('loading');
  });

  test('happy: preserves value when status changes', () => {
    const readyText = new Loadable<string>({ status: 'ready', value: 'alpha' });
    const next = readyText.withStatus('error');
    expect(next.value).toBe('alpha');
  });

  test('happy: marks new values ready', () => {
    const loadingText = new Loadable<string>({ status: 'loading', value: null });
    const next = loadingText.withValue('beta');
    expect(next.status).toBe('ready');
    expect(next.value).toBe('beta');
  });
});
