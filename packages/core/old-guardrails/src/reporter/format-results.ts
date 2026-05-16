import pc from 'picocolors';
import type { CheckResult, Diagnostic, RunResult } from '../types';
import type { DiagnosticGroups, DiagnosticKeyFunction } from './types';

const DETAIL_INDENT = '         ';
const SNIPPET_INDENT = '           ';

export function formatResults(result: RunResult) {
  const lines = [''];

  for (const check of result.results) {
    if (check.passed) {
      lines.push(formatPassLine(check));
    }
  }

  for (const check of result.results) {
    if (!check.passed) {
      lines.push(...formatFailureSections(check));
    }
  }

  lines.push(formatSeparator(), '', formatSummaryLine(result), '');
  return lines.join('\n');
}

function formatPassLine(check: CheckResult) {
  return `  ${pc.bgGreen(pc.black(' PASS '))} ${pc.green(ruleId(check.rule))}  ${pc.dim(`${check.durationMs}ms`)}`;
}

function formatFailureSections(check: CheckResult) {
  const lines: string[] = [];

  for (const [error, diagnostics] of groupDiagnostics(check.diagnostics, (diagnostic) => diagnostic.error)) {
    const first = diagnostics[0];
    if (!first) {
      continue;
    }

    lines.push('');
    lines.push(formatFailureHeader(check, error, diagnostics));
    lines.push(`${DETAIL_INDENT}${first.description}`);
    lines.push(`${DETAIL_INDENT}${pc.cyan('fix:')} ${first.recommendation}`);
    lines.push(...formatDiagnosticFiles(diagnostics));
  }

  return lines;
}

function formatFailureHeader(check: CheckResult, error: string, diagnostics: Diagnostic[]) {
  const errorId = `${ruleId(check.rule)}/${error}`;
  const errorText = pc.yellow(pluralize(diagnostics.length, 'error'));
  const fileText = pc.yellow(pluralize(countDiagnosticFiles(diagnostics), 'file'));

  return [
    `  ${pc.bgRed(pc.white(' FAIL '))} ${pc.red(pc.bold(errorId))}`,
    pc.dim('—'),
    `${errorText} in ${fileText}`,
    pc.dim(`${check.durationMs}ms`),
  ].join('  ');
}

function formatDiagnosticFiles(diagnostics: Diagnostic[]) {
  const lines: string[] = [];

  for (const [file, fileDiagnostics] of groupDiagnostics(diagnostics, diagnosticFile)) {
    lines.push('');
    lines.push(`${DETAIL_INDENT}${pc.underline(file)}`);

    for (const diagnostic of fileDiagnostics) {
      lines.push(...formatSnippet(diagnostic));
    }
  }

  return lines;
}

function formatSnippet(diagnostic: Diagnostic) {
  if (!diagnostic.snippet) {
    return [];
  }

  return [...diagnostic.snippet.split('\n').map(formatSnippetLine), ''];
}

function formatSnippetLine(line: string) {
  return `${SNIPPET_INDENT}${line.startsWith('>') ? pc.red(line) : pc.dim(line)}`;
}

function formatSummaryLine(result: RunResult) {
  const checked = checkedRulesText(result);
  const scanned = scannedFilesText(result);
  const elapsed = pc.dim(`${result.totalDurationMs}ms`);

  if (result.passed) {
    return joinSummaryParts(`  ${pc.green('✓')} ${checked}`, scanned, pc.green('0 errors'), elapsed);
  }

  return joinSummaryParts(
    `  ${pc.red('✗')} ${checked}`,
    scanned,
    `${errorCountText(result)} across ${failedFilesText(result)}`,
    elapsed,
  );
}

function checkedRulesText(result: RunResult) {
  return `${pc.bold(String(result.results.length))} rule${result.results.length === 1 ? '' : 's'} checked`;
}

function scannedFilesText(result: RunResult) {
  const fileCount = new Set(result.results.flatMap((check) => [...check.filesScanned])).size;
  return `${pc.bold(String(fileCount))} file${fileCount === 1 ? '' : 's'} scanned`;
}

function errorCountText(result: RunResult) {
  const errorCount = result.results.reduce((sum, check) => sum + check.diagnostics.length, 0);
  return `${pc.red(pc.bold(String(errorCount)))} error${errorCount === 1 ? '' : 's'}`;
}

function failedFilesText(result: RunResult) {
  const fileCount = countDiagnosticFiles(result.results.flatMap((check) => check.diagnostics));
  return `${pc.red(pc.bold(String(fileCount)))} file${fileCount === 1 ? '' : 's'} with errors`;
}

function joinSummaryParts(...parts: string[]) {
  return parts.join(`  ${pc.dim('·')}  `);
}

function formatSeparator() {
  return pc.dim('  ─'.repeat(30));
}

function ruleId(rule: string) {
  return `@rule/${rule}`;
}

function diagnosticFile(diagnostic: Diagnostic) {
  return diagnostic.file ?? '<unknown>';
}

function countDiagnosticFiles(diagnostics: Diagnostic[]) {
  return new Set(diagnostics.map((diagnostic) => diagnostic.file).filter(Boolean)).size;
}

function groupDiagnostics(diagnostics: Diagnostic[], keyFor: DiagnosticKeyFunction): DiagnosticGroups {
  const groups = new Map<string, Diagnostic[]>();

  for (const diagnostic of diagnostics) {
    const key = keyFor(diagnostic);
    const group = groups.get(key) ?? [];
    group.push(diagnostic);
    groups.set(key, group);
  }

  return groups;
}

function pluralize(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? '' : 's'}`;
}
