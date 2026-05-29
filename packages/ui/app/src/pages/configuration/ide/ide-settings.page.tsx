import { Header, Icon, PageLayout, Section, Surface, useToast } from '@two-pebble/components';
import {
  type KnownIdeRecord,
  useAppSettings,
  useCreateKnownIde,
  useDetectIdes,
  useKnownIdes,
  useUpdateAppSettings,
} from '@two-pebble/realtime';
import { useEffect, useRef, useState } from 'react';
import { IdeLogo } from './ide-logo';

export function IdeSettingsPage() {
  const appSettings = useAppSettings();
  const knownIdes = useKnownIdes();
  const updateAppSettings = useUpdateAppSettings();
  const detectIdes = useDetectIdes();
  const createKnownIde = useCreateKnownIde();
  const { toast } = useToast();
  const [detecting, setDetecting] = useState(true);
  const syncedRef = useRef(false);

  const settings = appSettings.value;
  const ides = knownIdes.values().sort((left, right) => left.displayName.localeCompare(right.displayName));
  const defaultKnownIdeId = settings?.defaultKnownIdeId ?? null;
  const idesReady = knownIdes.status !== 'idle' && knownIdes.status !== 'loading';

  // Auto-detect installed editors once the saved list has loaded and persist
  // any that aren't recorded yet, so the list always reflects what's on the
  // machine without an explicit detect/add step. Matching on executablePath
  // keeps repeated visits from creating duplicates.
  useEffect(() => {
    if (syncedRef.current || !idesReady) {
      return;
    }
    syncedRef.current = true;
    void (async () => {
      setDetecting(true);
      try {
        const result = await detectIdes();
        const existing = new Set(knownIdes.values().map((ide) => ide.executablePath));
        const seen = new Set<string>();
        for (const candidate of result.candidates) {
          if (existing.has(candidate.executablePath) || seen.has(candidate.executablePath)) {
            continue;
          }
          seen.add(candidate.executablePath);
          await createKnownIde(candidate);
        }
      } catch (failure) {
        toast(errorMessage(failure, 'Could not detect IDEs.'), 'error');
      } finally {
        setDetecting(false);
      }
    })();
  }, [idesReady, knownIdes, detectIdes, createKnownIde, toast]);

  const selectIde = (id: string) => {
    if (settings === null) {
      return;
    }
    const nextDefault = defaultKnownIdeId === id ? null : id;
    void updateAppSettings({
      defaultKnownIdeId: nextDefault,
      defaultTranscriptionProfileId: settings.defaultTranscriptionProfileId,
      defaultSpeechProfileId: settings.defaultSpeechProfileId,
      assistantAgentRegistryId: settings.assistantAgentRegistryId,
      assistantAgentId: settings.assistantAgentId,
      assistantCommandKEnabled: settings.assistantCommandKEnabled,
      assistantCommandKVoiceModeEnabled: settings.assistantCommandKVoiceModeEnabled,
      chatConversationFoldingEnabled: settings.chatConversationFoldingEnabled,
      documentRunnerAgentRegistryId: settings.documentRunnerAgentRegistryId,
    }).catch((failure) => {
      toast(errorMessage(failure, 'Could not update the default IDE.'), 'error');
    });
  };

  const emptyText = detecting ? 'Detecting installed editors.' : 'No editors detected on this machine.';

  return (
    <PageLayout width="fixed">
      <Header subtitle="Editors detected on this machine. Select the one used to open agent workspaces.">IDE</Header>

      <Section subtitle="Detected editors. Select one to use it by default." title="Editors">
        <Surface>
          <div className="flex flex-col gap-2">
            {ides.length === 0 ? <p className="text-[12px] leading-4 text-content-muted">{emptyText}</p> : null}
            {ides.map((ide) => (
              <IdeSelectRow
                key={ide.id}
                ide={ide}
                selected={defaultKnownIdeId === ide.id}
                onSelect={() => selectIde(ide.id)}
              />
            ))}
          </div>
        </Surface>
      </Section>
    </PageLayout>
  );
}

function IdeSelectRow(props: { ide: KnownIdeRecord; selected: boolean; onSelect: () => void }) {
  const stateClasses = props.selected ? 'border-accent bg-accent/[0.08]' : 'border-border hover:bg-surface-hover';
  return (
    <button
      aria-pressed={props.selected}
      className={`flex w-full min-w-0 items-center justify-between gap-3 rounded-md border px-3 py-2 text-left transition-colors ${stateClasses}`}
      onClick={props.onSelect}
      type="button"
    >
      <span className="flex min-w-0 items-center gap-2">
        <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center text-content-muted">
          <IdeLogo kind={props.ide.kind} className="h-4 w-4" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-medium leading-5 text-content">{props.ide.displayName}</span>
          <span className="block truncate text-[12px] leading-4 text-content-muted">{props.ide.executablePath}</span>
        </span>
      </span>
      {props.selected ? <Icon name="check" color="text-accent" /> : null}
    </button>
  );
}

function errorMessage(failure: unknown, fallback: string) {
  return failure instanceof Error ? failure.message : fallback;
}
