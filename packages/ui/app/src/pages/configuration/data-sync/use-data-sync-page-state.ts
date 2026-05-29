import type { ReconcilePlan, SyncDirection } from '@two-pebble/protocol';
import { toggleSelection } from '@two-pebble/protocol';
import { useApplyDataSyncPlan, useAppSettings, useDataSyncPlan, useUpdateAppSettings } from '@two-pebble/realtime';
import { useEffect, useState } from 'react';

export interface ApplySummary {
  applied: number;
  skipped: number;
  orphansRemoved: number;
  warnings: string[];
  direction: SyncDirection;
}

/**
 * Owns the data-sync page: the persisted directory, the in-flight reconcile
 * plan, and the apply summary. Toggling an entry recomputes the cascade
 * locally via `toggleSelection`; the daemon stays stateless between build
 * and apply.
 */
export function useDataSyncPageState() {
  const appSettings = useAppSettings();
  const updateAppSettings = useUpdateAppSettings();
  const buildPlan = useDataSyncPlan();
  const applyPlan = useApplyDataSyncPlan();

  const settings = appSettings.value;
  const [directory, setDirectory] = useState('');
  const [directoryLoaded, setDirectoryLoaded] = useState(false);
  const [plan, setPlan] = useState<ReconcilePlan | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState<ApplySummary | null>(null);

  useEffect(() => {
    if (!directoryLoaded && settings !== null) {
      setDirectory(settings.syncDirectory ?? '');
      setDirectoryLoaded(true);
    }
  }, [directoryLoaded, settings]);

  const saveDirectory = async () => {
    if (settings === null) {
      return;
    }
    setError('');
    try {
      await updateAppSettings({
        defaultKnownIdeId: settings.defaultKnownIdeId,
        defaultTranscriptionProfileId: settings.defaultTranscriptionProfileId,
        defaultSpeechProfileId: settings.defaultSpeechProfileId,
        assistantAgentRegistryId: settings.assistantAgentRegistryId,
        assistantAgentId: settings.assistantAgentId,
        assistantCommandKVoiceModeEnabled: settings.assistantCommandKVoiceModeEnabled,
        chatConversationFoldingEnabled: settings.chatConversationFoldingEnabled,
        documentRunnerAgentRegistryId: settings.documentRunnerAgentRegistryId,
        syncDirectory: directory.trim().length === 0 ? null : directory.trim(),
      });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not save the sync directory.');
    }
  };

  const build = async (direction: SyncDirection) => {
    if (directory.trim().length === 0) {
      setError('Choose a sync directory first.');
      return;
    }
    setError('');
    setSummary(null);
    setBusy(true);
    try {
      const result = await buildPlan({
        direction,
        directory: directory.trim(),
        projectNames: [],
      });
      setPlan(result);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not build the plan.');
    } finally {
      setBusy(false);
    }
  };

  const toggleEntry = (key: string, selected: boolean) => {
    setPlan((current) => (current === null ? current : toggleSelection(current, key, selected)));
  };

  const apply = async () => {
    if (plan === null) {
      return;
    }
    setError('');
    setBusy(true);
    try {
      const result = await applyPlan({ plan });
      setSummary({ ...result, direction: plan.direction });
      setPlan(null);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not apply the plan.');
    } finally {
      setBusy(false);
    }
  };

  const discardPlan = () => {
    setPlan(null);
    setSummary(null);
  };

  return {
    apply,
    build,
    busy,
    directory,
    discardPlan,
    error,
    plan,
    saveDirectory,
    setDirectory,
    summary,
    toggleEntry,
  };
}
