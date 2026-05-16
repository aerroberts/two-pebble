/**
 * Defines the DatabaseTableDescription protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface DatabaseTableDescription {
  name: string;
  rowCount: number;
  sizeBytes: number;
}

/**
 * Defines the DatabaseDescribeOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface DatabaseDescribeOperation {
  name: 'describeDatabase';
  request: Record<string, never>;
  response: {
    path: string;
    tables: DatabaseTableDescription[];
  };
}
