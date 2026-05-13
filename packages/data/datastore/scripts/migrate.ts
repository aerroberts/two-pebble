import path from 'node:path';

import { Datastore } from '../src';

const input =
  process.env.TWO_PEBBLE_DATABASE_PATH === undefined
    ? {
        databaseFilePath: path.resolve(import.meta.dirname, '..', '..', '..', '..', '.data', 'two-pebble.db'),
      }
    : { databaseFilePath: process.env.TWO_PEBBLE_DATABASE_PATH };
const datastore = new Datastore(input);

try {
  await datastore.migrate();
} finally {
  await datastore.close();
}
