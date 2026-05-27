import {
  Button,
  Header,
  Icon,
  IconButton,
  Input,
  PageLayout,
  Section,
  Select,
  type SelectOption,
  Surface,
  Tooltip,
  useToast,
} from '@two-pebble/components';
import {
  type KnownIdeCandidate,
  type KnownIdeKind,
  type KnownIdeRecord,
  useAppSettings,
  useCreateKnownIde,
  useDeleteKnownIde,
  useDetectIdes,
  useKnownIdes,
  useUpdateAppSettings,
} from '@two-pebble/realtime';
import { type ReactNode, useState } from 'react';
import { iconForKind } from './icon-for-kind';

const KIND_OPTIONS: SelectOption[] = [
  { label: 'VS Code', value: 'vscode' },
  { label: 'Zed', value: 'zed' },
  { label: 'Cursor', value: 'cursor' },
  { label: 'Other', value: 'other' },
];

export function IdeSettingsPage() {
  const appSettings = useAppSettings();
  const knownIdes = useKnownIdes();
  const updateAppSettings = useUpdateAppSettings();
  const detectIdes = useDetectIdes();
  const createKnownIde = useCreateKnownIde();
  const deleteKnownIde = useDeleteKnownIde();
  const { toast } = useToast();
  const [candidates, setCandidates] = useState<KnownIdeCandidate[]>([]);
  const [detecting, setDetecting] = useState(false);
  const [creatingKey, setCreatingKey] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [customKind, setCustomKind] = useState<KnownIdeKind>('other');
  const [customDisplayName, setCustomDisplayName] = useState('');
  const [customExecutablePath, setCustomExecutablePath] = useState('');

  const settings = appSettings.value;
  const savedIdes = knownIdes.values().sort((left, right) => left.displayName.localeCompare(right.displayName));
  const defaultKnownIdeId = settings?.defaultKnownIdeId ?? null;

  const runDetection = async () => {
    setDetecting(true);
    try {
      const result = await detectIdes();
      setCandidates(result.candidates);
    } catch (failure) {
      toast(errorMessage(failure, 'Could not detect IDEs.'), 'error');
    } finally {
      setDetecting(false);
    }
  };

  const addCandidate = async (candidate: KnownIdeCandidate) => {
    const key = candidate.executablePath;
    setCreatingKey(key);
    try {
      await createKnownIde(candidate);
      setCandidates((current) => current.filter((item) => item.executablePath !== candidate.executablePath));
      toast(`Added ${candidate.displayName}.`, 'success');
    } catch (failure) {
      toast(errorMessage(failure, `Could not add ${candidate.displayName}.`), 'error');
    } finally {
      setCreatingKey(null);
    }
  };

  const addCustom = async () => {
    const displayName = customDisplayName.trim();
    const executablePath = customExecutablePath.trim();
    if (displayName.length === 0 || executablePath.length === 0) {
      toast('Enter both a display name and executable path.', 'error');
      return;
    }

    setCreatingKey('custom');
    try {
      await createKnownIde({ kind: customKind, displayName, executablePath });
      setCustomDisplayName('');
      setCustomExecutablePath('');
      toast(`Added ${displayName}.`, 'success');
    } catch (failure) {
      toast(errorMessage(failure, `Could not add ${displayName}.`), 'error');
    } finally {
      setCreatingKey(null);
    }
  };

  const setDefault = (id: string | null) => {
    if (settings === null) {
      return;
    }
    void updateAppSettings({
      defaultKnownIdeId: id,
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

  const removeIde = async (ide: KnownIdeRecord) => {
    setDeletingId(ide.id);
    const wasDefault = defaultKnownIdeId === ide.id;
    try {
      await deleteKnownIde({ id: ide.id });
      toast(`Deleted ${ide.displayName}.`, 'success');
      if (wasDefault) {
        toast(`Default IDE cleared because ${ide.displayName} was removed.`, 'info');
      }
    } catch (failure) {
      toast(errorMessage(failure, `Could not delete ${ide.displayName}.`), 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <PageLayout width="fixed">
      <Header
        actionItems={
          <Tooltip content="Detect IDEs">
            <IconButton
              aria-label="Detect IDEs"
              disabled={detecting}
              icon="search"
              onClick={() => void runDetection()}
              type="button"
            />
          </Tooltip>
        }
        subtitle="Choose the editor used to open agent workspaces."
      >
        IDE
      </Header>

      <Section subtitle="Detected editors that are not saved yet." title="Detected">
        <Surface>
          <IdeListEmpty visible={candidates.length === 0} text={detecting ? 'Detecting IDEs.' : 'No IDEs detected.'} />
          <div className="flex flex-col gap-2">
            {candidates.map((candidate) => (
              <IdeRow
                key={candidate.executablePath}
                action={
                  <Button
                    disabled={creatingKey === candidate.executablePath}
                    leftIcon="plus"
                    onClick={() => void addCandidate(candidate)}
                    type="button"
                  >
                    Add
                  </Button>
                }
                displayName={candidate.displayName}
                executablePath={candidate.executablePath}
                kind={candidate.kind}
              />
            ))}
          </div>
        </Surface>
      </Section>

      <Section
        subtitle="Add an editor whose executable is not on PATH or in a standard bundle path."
        title="Add custom"
      >
        <Surface>
          <div className="flex flex-col gap-2">
            <Select
              label="Kind"
              onChange={(value) => setCustomKind(value as KnownIdeKind)}
              options={KIND_OPTIONS}
              value={customKind}
            />
            <Input
              label="Display name"
              onChange={(event) => setCustomDisplayName(event.target.value)}
              value={customDisplayName}
            />
            <Input
              label="Executable path"
              onChange={(event) => setCustomExecutablePath(event.target.value)}
              value={customExecutablePath}
            />
            <div className="flex justify-end">
              <Button
                disabled={creatingKey === 'custom'}
                leftIcon="plus"
                onClick={() => void addCustom()}
                type="button"
              >
                Add IDE
              </Button>
            </div>
          </div>
        </Surface>
      </Section>

      <Section subtitle="Saved editors and the default used by the chat button." title="Saved IDEs">
        <Surface>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 text-[12px] font-medium text-content">
              <input
                checked={defaultKnownIdeId === null}
                name="default-ide"
                onChange={() => setDefault(null)}
                type="radio"
              />
              None
            </label>
            <IdeListEmpty
              visible={savedIdes.length === 0}
              text={knownIdes.status === 'loading' ? 'Loading saved IDEs.' : 'No saved IDEs.'}
            />
            {savedIdes.map((ide) => (
              <IdeRow
                key={ide.id}
                action={
                  <div className="flex items-center gap-2">
                    <input
                      aria-label={`Use ${ide.displayName} by default`}
                      checked={defaultKnownIdeId === ide.id}
                      name="default-ide"
                      onChange={() => setDefault(ide.id)}
                      type="radio"
                    />
                    <Tooltip content={`Delete ${ide.displayName}`}>
                      <IconButton
                        aria-label={`Delete ${ide.displayName}`}
                        disabled={deletingId === ide.id}
                        icon="trash-2"
                        onClick={() => void removeIde(ide)}
                        type="button"
                        variant="secondary"
                      />
                    </Tooltip>
                  </div>
                }
                displayName={ide.displayName}
                executablePath={ide.executablePath}
                kind={ide.kind}
              />
            ))}
          </div>
        </Surface>
      </Section>
    </PageLayout>
  );
}

function IdeListEmpty(props: { visible: boolean; text: string }) {
  if (!props.visible) {
    return null;
  }
  return <p className="text-[12px] leading-4 text-content-muted">{props.text}</p>;
}

function IdeRow(props: { action: ReactNode; displayName: string; executablePath: string; kind: KnownIdeKind }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-content-muted">
          <IconForKind kind={props.kind} />
        </span>
        <div className="min-w-0">
          <div className="truncate text-[13px] font-medium leading-5 text-content">{props.displayName}</div>
          <div className="truncate text-[12px] leading-4 text-content-muted">{props.executablePath}</div>
        </div>
      </div>
      {props.action}
    </div>
  );
}

function IconForKind(props: { kind: KnownIdeKind }) {
  return <Icon name={iconForKind(props.kind)} color="text-current" />;
}

function errorMessage(failure: unknown, fallback: string) {
  return failure instanceof Error ? failure.message : fallback;
}
