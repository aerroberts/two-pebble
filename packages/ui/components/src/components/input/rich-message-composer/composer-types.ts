import type { CellContent } from '@two-pebble/pebble';

export interface RichComposerDocument {
  id: string;
  name: string;
}

export interface RichComposerSubmitPayload {
  markdown: string;
  cells: CellContent[];
}

export interface RichComposerSlashTrigger {
  /** Anchor coordinates relative to the viewport (left, top of the `/`). */
  anchorLeft: number;
  anchorTop: number;
  /** Document position of the `/`. */
  from: number;
  /** Document position of the cursor (end of the typed query). */
  to: number;
  /** The text typed after the `/`, lowercase. */
  query: string;
}
