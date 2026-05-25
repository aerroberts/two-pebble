import pc from 'picocolors';
import type { CheckResult, RunResult } from '../types';

const DETAIL_INDENT = '         ';

/**
 * Renders a run result as a colorized terminal report.
 */
export function formatResults(result: RunResult) {
  const lines = [''];

  for (const check of result.results) {
    if (check.passed) {
      lines.push(formatPassLine(check));
    }
  }

  for (const check of result.results) {
    if (!check.passed) {
      lines.push(...formatFailureSection(check));
    }
  }

  lines.push(formatSeparator(), '', formatSummaryLine(result), '');
  return lines.join('\n');
}

function formatPassLine(check: CheckResult) {
  return `  ${pc.bgGreen(pc.black(' PASS '))} ${pc.green(check.find)}  ${pc.dim(`${check.durationMs}ms`)}`;
}

function formatFailureSection(check: CheckResult) {
  const lines: string[] = [''];
  lines.push(
    [
      `  ${pc.bgRed(pc.white(' FAIL '))} ${pc.red(pc.bold(check.find))}`,
      pc.dim('—'),
      pc.yellow(`${check.diagnostics.length} error${check.diagnostics.length === 1 ? '' : 's'}`),
      pc.dim(`${check.durationMs}ms`),
    ].join('  '),
  );
  for (const diagnostic of check.diagnostics) {
    lines.push(`${DETAIL_INDENT}${diagnostic.description}`);
    if (diagnostic.guidance.length > 0) {
      const guidanceLines = diagnostic.guidance.split('\n');
      const [firstGuidance, ...restGuidance] = guidanceLines;
      lines.push(`${DETAIL_INDENT}${pc.cyan('fix:')} ${firstGuidance ?? ''}`);
      for (const continued of restGuidance) {
        lines.push(`${DETAIL_INDENT}     ${continued}`);
      }
    }
    lines.push(`${DETAIL_INDENT}${pc.dim(`assertion: ${diagnostic.assertion}`)}`);
  }
  return lines;
}

function formatSummaryLine(result: RunResult) {
  const checked = `${pc.bold(String(result.results.length))} rule${result.results.length === 1 ? '' : 's'} checked`;
  const scanned = `${pc.bold(String(result.filesScanned.size))} file${result.filesScanned.size === 1 ? '' : 's'} scanned`;
  const elapsed = pc.dim(`${result.totalDurationMs}ms`);

  if (result.passed) {
    return joinSummaryParts(`  ${pc.green('✓')} ${checked}`, scanned, pc.green('0 errors'), elapsed);
  }

  const errorCount = result.results.reduce((sum, check) => sum + check.diagnostics.length, 0);
  return joinSummaryParts(
    `  ${pc.red('✗')} ${checked}`,
    scanned,
    `${pc.red(pc.bold(String(errorCount)))} error${errorCount === 1 ? '' : 's'}`,
    elapsed,
  );
}

function joinSummaryParts(...parts: string[]) {
  return parts.join(`  ${pc.dim('·')}  `);
}

function formatSeparator() {
  return pc.dim('  ─'.repeat(30));
}
