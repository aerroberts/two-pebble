import { Tooltip, useToast } from '@two-pebble/components';
import { useAppSettings, useKnownIdes, useOpenWorkspaceInIde } from '@two-pebble/realtime';
import { useState } from 'react';
import { IdeLogoButton } from '../configuration/ide/ide-logo';

export function OpenInIdeButton(props: { workspacePath: string | null }) {
  const appSettings = useAppSettings();
  const knownIdes = useKnownIdes();
  const openWorkspaceInIde = useOpenWorkspaceInIde();
  const { toast } = useToast();
  const [pending, setPending] = useState(false);

  const defaultKnownIdeId = appSettings.value?.defaultKnownIdeId ?? null;
  const ide = defaultKnownIdeId === null ? null : (knownIdes.getItem(defaultKnownIdeId)?.value ?? null);

  if (props.workspacePath === null || ide === null) {
    return null;
  }

  const open = async () => {
    setPending(true);
    try {
      await openWorkspaceInIde({ knownIdeId: ide.id, workspacePath: props.workspacePath ?? '' });
    } catch (failure) {
      const message = failure instanceof Error ? failure.message : 'Unknown error';
      toast(`Could not open ${ide.displayName}: ${message}`, 'error');
    } finally {
      setPending(false);
    }
  };

  return (
    <Tooltip content={`Open in ${ide.displayName}`}>
      <IdeLogoButton
        aria-label={`Open in ${ide.displayName}`}
        disabled={pending}
        kind={ide.kind}
        onClick={() => void open()}
      />
    </Tooltip>
  );
}
