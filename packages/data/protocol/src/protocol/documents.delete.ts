export interface DeleteDocumentOperation {
  name: 'deleteDocument';
  request: {
    id: string;
  };
  response: {
    id: string;
  };
}
