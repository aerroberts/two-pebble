import fs from 'node:fs';
import path from 'node:path';
import { logger, MemorySink } from '@two-pebble/logger';
import { Datastore } from '../datastore';

const testDatabasesDirectory = path.resolve(import.meta.dirname, '..', '..', '.test');
logger.useSink(new MemorySink());

export async function useDatastoreForTesting() {
  fs.mkdirSync(testDatabasesDirectory, { recursive: true });

  const databaseFilePath = path.join(testDatabasesDirectory, `${crypto.randomUUID()}.sqlite`);
  const datastore = new Datastore({
    databaseFilePath,
  });
  const close = datastore.close.bind(datastore);
  await datastore.migrate();

  return Object.assign(datastore, {
    async close() {
      await close();
      fs.rmSync(databaseFilePath, { force: true });
      fs.rmSync(`${databaseFilePath}-shm`, { force: true });
      fs.rmSync(`${databaseFilePath}-wal`, { force: true });
    },
  });
}
