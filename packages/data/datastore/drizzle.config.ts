import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { defineConfig } from 'drizzle-kit';

const databaseFilePath = path.join(os.homedir(), '.two-pebble', 'data', 'two-pebble-49152.db');

fs.mkdirSync(path.dirname(databaseFilePath), { recursive: true });

export default defineConfig({
  dbCredentials: {
    url: databaseFilePath,
  },
  dialect: 'sqlite',
  out: './migrations',
  schema: './src/schema/index.ts',
});
