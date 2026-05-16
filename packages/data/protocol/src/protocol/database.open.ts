/**
 * Defines the DatabaseOpenOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface DatabaseOpenOperation {
  name: 'openDatabase';
  request: Record<string, never>;
  response: {
    path: string;
  };
}
