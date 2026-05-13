/// <reference path="../../../text-imports.d.ts" />

import type { CellContent, DataCells } from '../../cells/index';
import { Cell } from '../../cells/index';
import customToolParsingFormatText from './custom-tool-parsing-format.md?raw';

export function customToolParsingFormat(agentId: string): DataCells {
  return [Cell.text(customToolParsingFormatText.replaceAll('{{agentId}}', agentId))];
}
