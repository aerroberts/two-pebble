import type { IdeKind } from '@two-pebble/datatypes';
import type { LoadableRegistry } from '../../loadable';
import type { RealtimeEmitPayload, RealtimeEmitResponse } from '../../types';

export interface KnownIdesState {
  knownIdes: LoadableRegistry<KnownIdeRecord>;
}

export type KnownIdeRecord = RealtimeEmitResponse<'listKnownIdes'>['items'][number];
export type KnownIdeCandidate = RealtimeEmitResponse<'detectIdes'>['candidates'][number];
export type CreateKnownIdeInput = RealtimeEmitPayload<'createKnownIde'>;
export type DeleteKnownIdeInput = RealtimeEmitPayload<'deleteKnownIde'>;
export type OpenWorkspaceInIdeInput = RealtimeEmitPayload<'openWorkspaceInIde'>;
export type KnownIdeKind = IdeKind;
