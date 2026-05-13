export interface DatabaseOpenOperation {
  name: 'openDatabase';
  request: Record<string, never>;
  response: {
    path: string;
  };
}
