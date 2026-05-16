import { Metrics } from './metrics';

/**
 * Shared process-wide metrics collector.
 *
 * Use this singleton for callers that do not need an isolated collector.
 */
export const metrics = new Metrics();
