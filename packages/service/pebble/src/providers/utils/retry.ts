/**
 * Returns true for HTTP statuses that indicate a transient upstream failure
 * worth retrying. The list covers timeout (408), conflict (409), too-early
 * (425), rate-limit (429), and every 5xx — anything else is treated as a
 * client error the caller would have to fix before another attempt could
 * succeed.
 */
export function isRetryableProviderStatus(status: number): boolean {
  return status === 408 || status === 409 || status === 425 || status === 429 || status >= 500;
}

export interface RetryableResult {
  status: 'success' | 'error';
  retryable?: boolean;
}

export interface WithRetriesOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  sleep?: (ms: number) => Promise<void>;
}

type RetrySleep = (ms: number) => Promise<void>;

const DEFAULT_MAX_ATTEMPTS = 5;
const DEFAULT_INITIAL_DELAY_MS = 5000;
const DEFAULT_MAX_DELAY_MS = 30_000;

/**
 * Runs `attempt` up to `maxAttempts` times with exponential backoff between
 * tries (initial 5s, doubling, capped at 30s). Retries when the result is
 * `{ status: 'error', retryable: true }`. Thrown errors are converted to a
 * retryable error result via `onException` — this is the path that catches
 * raw fetch failures (ECONNRESET, DNS, abort) so transport problems don't
 * bypass the retry loop entirely.
 */
export async function withRetries<T extends RetryableResult>(
  attempt: () => Promise<T>,
  onException: (error: ProviderException) => T,
  options: WithRetriesOptions,
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const initialDelayMs = options.initialDelayMs ?? DEFAULT_INITIAL_DELAY_MS;
  const maxDelayMs = options.maxDelayMs ?? DEFAULT_MAX_DELAY_MS;
  const sleep: RetrySleep = options.sleep ?? defaultSleep;

  let lastResult: T;
  for (let i = 1; i <= maxAttempts; i += 1) {
    try {
      lastResult = await attempt();
    } catch (error) {
      lastResult = onException(error instanceof Error ? error : String(error));
    }
    if (lastResult.status !== 'error' || lastResult.retryable !== true || i === maxAttempts) {
      return lastResult;
    }
    await sleep(Math.min(2 ** (i - 1) * initialDelayMs, maxDelayMs));
  }
  // Unreachable: the for loop returns on the final attempt.
  throw new Error('withRetries: loop exited without returning a result');
}

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
import type { ProviderException } from '../types';
