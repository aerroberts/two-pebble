import { readFileSync } from 'node:fs';
import type { Diagnostic, DiagnosticError } from '../types';

/**
 * Collects diagnostics for a single rule/file execution pair.
 */
export class Reporter {
  public readonly rule: string;
  public readonly file?: string;
  public readonly diagnostics: Diagnostic[] = [];
  private readonly fileCache = new Map<string, string[]>();

  public constructor(rule: string, file: string | undefined) {
    this.rule = rule;
    this.file = file;
  }

  // Returns whether the reporter has collected any diagnostics.
  public get passed() {
    return this.diagnostics.length === 0;
  }

  /**
   * Records a diagnostic failure for the current file.
   * Diagnostics without locations still remain grouped by file.
   */
  public fail(error: DiagnosticError) {
    this.record(error, undefined);
  }

  /**
   * Records a diagnostic failure with source context.
   * The line number is expanded into a nearby source snippet.
   */
  public failAtLine(error: DiagnosticError, line: number) {
    this.record(error, line);
  }

  private record(error: DiagnosticError, line: number | undefined) {
    this.diagnostics.push({
      file: this.file,
      line,
      snippet: this.file && line ? this.getSnippet(this.file, line, undefined) : undefined,
      ...error,
    });
  }

  private getLines(file: string) {
    let lines = this.fileCache.get(file);
    if (!lines) {
      lines = readFileSync(file, 'utf-8').split('\n');
      this.fileCache.set(file, lines);
    }

    return lines;
  }

  private getSnippet(file: string, line: number, context: number | undefined) {
    const lines = this.getLines(file);
    const contextLines = context ?? 1;
    const start = Math.max(0, line - 1 - contextLines);
    const end = Math.min(lines.length, line + contextLines);
    const gutterWidth = String(end).length;

    return lines
      .slice(start, end)
      .map((text, index) => {
        const lineNumber = start + index + 1;
        const gutter = String(lineNumber).padStart(gutterWidth);
        const marker = lineNumber === line ? '>' : ' ';
        return `${marker} ${gutter} | ${text}`;
      })
      .join('\n');
  }
}
