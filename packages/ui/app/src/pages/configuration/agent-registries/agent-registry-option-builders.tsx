import { ClaudeCodeLogo, CodexLogo, ProviderLogo } from '@two-pebble/components';
import type { InferenceProfileRecord, LoadableRegistry, ThirdPartyAgentInstallRecord } from '@two-pebble/realtime';
import { createElement } from 'react';

export function buildInferenceProfileOptions(inferenceProfiles: LoadableRegistry<InferenceProfileRecord>) {
  return inferenceProfiles
    .values()
    .filter((profile) => profile.kind === 'intelligence')
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((profile) => ({
      icon: createElement(ProviderLogo, { provider: profile.provider, size: 'xs' }),
      label: profile.name.length > 0 ? profile.name : profile.provider,
      value: profile.id,
    }));
}

export function buildInstallOptions(installs: LoadableRegistry<ThirdPartyAgentInstallRecord>) {
  return installs
    .values()
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((install) => ({
      icon: createElement(install.frameworkId === 'codex' ? CodexLogo : ClaudeCodeLogo, { size: 'xs' }),
      label: install.name.length > 0 ? install.name : install.frameworkId,
      value: install.id,
    }));
}
