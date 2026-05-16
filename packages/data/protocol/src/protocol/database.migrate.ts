/**
 * Defines the DatabaseMigrateOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface DatabaseMigrateOperation {
  name: 'migrateDatabase';
  request: Record<string, never>;
  response: {
    migrated: true;
  };
}
