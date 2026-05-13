export interface DatabaseMigrateOperation {
  name: 'migrateDatabase';
  request: Record<string, never>;
  response: {
    migrated: true;
  };
}
