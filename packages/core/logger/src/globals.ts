import { Logger } from './logger/logger';
import { PrettySink } from './sinks/pretty-sink';

/**
 * Process-wide logger singleton used by packages that do not own sink setup.
 *
 * Runtime entrypoints can replace the sink during startup, while leaf modules
 * keep importing this stable instance for structured logging.
 */
export const logger = new Logger(new PrettySink({ output: process.stdout }));
