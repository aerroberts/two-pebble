import { scope } from '../scope/scope';
import type { LoggerContext, LoggerSink, LogLevel } from '../types';

/**
 * Structured logger that merges async scope into every entry.
 *
 * The logger does not know where entries are written. Sinks own output, while
 * the logger owns message shape, timestamps, and context serialization.
 */
export class Logger {
  private sink: LoggerSink;

  /**
   * Creates a logger backed by the provided sink.
   *
   * Tests can pass an in-memory sink, while runtime code can pass stdout or
   * another sink without changing call sites.
   */
  public constructor(sink: LoggerSink) {
    this.sink = sink;
  }

  /**
   * Replaces the sink used by this logger instance.
   *
   * Runtime entrypoints can configure the exported singleton once during
   * startup, while every package keeps importing and using the same logger.
   */
  public useSink(sink: LoggerSink): void {
    this.sink = sink;
  }

  /**
   * Writes a debug-level entry.
   *
   * Debug logs are intended for detailed local diagnostics and should not be
   * required to understand normal runtime behavior.
   */
  public debug(message: string, ...context: LoggerContext[]): void {
    this.log('debug', message, context);
  }

  /**
   * Writes an info-level entry.
   *
   * Info logs should describe important lifecycle progress such as startup,
   * shutdown, external calls, and completed units of work.
   */
  public info(message: string, ...context: LoggerContext[]): void {
    this.log('info', message, context);
  }

  /**
   * Writes a warning-level entry.
   *
   * Warnings should describe recoverable problems where the system continued
   * but behavior may be degraded or worth investigating.
   */
  public warn(message: string, ...context: LoggerContext[]): void {
    this.log('warn', message, context);
  }

  /**
   * Writes an error-level entry.
   *
   * Errors should capture failed operations. Put thrown errors in context so
   * stack traces and causes are serialized with the log entry.
   */
  public error(message: string, ...context: LoggerContext[]): void {
    this.log('error', message, context);
  }

  private log(level: LogLevel, message: string, context: LoggerContext[]): void {
    const scopedContext = scope();
    const mergedContext = { ...scopedContext, ...context[0] };
    this.sink.push({
      context: this.serializeContext(mergedContext),
      level,
      message,
      timestamp: new Date().toISOString(),
    });
  }

  private serializeContext(context: LoggerContext): LoggerContext {
    const result: LoggerContext = {};
    for (const [key, value] of Object.entries(context)) {
      result[key] = value instanceof Error ? this.serializeError(value) : value;
    }
    return result;
  }

  private serializeError(error: Error): LoggerContext {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
    };
  }
}
