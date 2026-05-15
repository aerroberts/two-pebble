import { LoadableRegistry } from '../../loadable';
import type { DocumentRecord, DocumentsState } from './types';

export function createDocumentsState(): DocumentsState {
  return {
    documents: new LoadableRegistry<DocumentRecord>(),
  };
}
