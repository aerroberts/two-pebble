import type { LoadableRegistry } from '../../loadable';
import type { RealtimeEmitPayload, RealtimeEmitResponse } from '../../types';

export interface DocumentsState {
  documents: LoadableRegistry<DocumentRecord>;
}

export type CreateDocumentInput = RealtimeEmitPayload<'createDocument'>;
export type CreateDocumentResponse = RealtimeEmitResponse<'createDocument'>;
export type ReadDocumentInput = RealtimeEmitPayload<'readDocument'>;
export type UpdateDocumentInput = RealtimeEmitPayload<'updateDocument'>;
export type DeleteDocumentInput = RealtimeEmitPayload<'deleteDocument'>;
export type DocumentRecord = RealtimeEmitResponse<'listDocuments'>['items'][number];
