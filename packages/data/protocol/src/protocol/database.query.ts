/**
 * Defines the DatabaseQueryRow protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface DatabaseQueryRow {
  [column: string]: boolean | null | number | string;
}

/**
 * Defines the DatabaseRunQueryOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface DatabaseRunQueryOperation {
  name: 'runDatabaseQuery';
  request: {
    query: string;
  };
  response: {
    columns: string[];
    rows: DatabaseQueryRow[];
    rowsAffected: number;
  };
}
