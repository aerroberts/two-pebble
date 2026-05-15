import type { AutomationRecord } from '@two-pebble/realtime';

export function formatAutomationInterval(automation: AutomationRecord): string {
  if (automation.intervalUnit === 'manual') {
    return 'Manual';
  }
  const unit = automation.intervalValue === 1 ? automation.intervalUnit.slice(0, -1) : automation.intervalUnit;
  return `Every ${automation.intervalValue} ${unit}`;
}

export function formatTimestamp(timestamp: number | null | undefined): string {
  if (timestamp === null || timestamp === undefined) {
    return 'Never';
  }
  return new Date(timestamp).toLocaleString();
}

export function nextDueAt(automation: AutomationRecord): number | null {
  if (automation.intervalUnit === 'manual') {
    return null;
  }
  const multiplier =
    automation.intervalUnit === 'minutes' ? 60_000 : automation.intervalUnit === 'hours' ? 3_600_000 : 86_400_000;
  return (automation.lastRanAt ?? automation.createdAt) + automation.intervalValue * multiplier;
}

/** Short cadence label for display in the automation list, e.g. "3H", "2D", "30M". */
export function formatCadenceLabel(automation: AutomationRecord): string {
  if (automation.intervalUnit === 'minutes') {
    return `${automation.intervalValue}M`;
  }
  if (automation.intervalUnit === 'hours') {
    return `${automation.intervalValue}H`;
  }
  if (automation.intervalUnit === 'days') {
    return `${automation.intervalValue}D`;
  }
  return '';
}
