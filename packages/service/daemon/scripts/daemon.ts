import { createDaemonLogFilePath, DAEMON_PORT, defaultDatabaseFilePath, defaultHost } from '../src/consts';
import { TwoPebbleDaemon } from '../src/two-pebble-daemon';

const explicitDatabasePath = process.env.TWO_PEBBLE_DATABASE_PATH;
const logFilePath = process.env.TWO_PEBBLE_LOG_FILE_PATH ?? createDaemonLogFilePath();
const daemon = new TwoPebbleDaemon({
  databaseFilePath: explicitDatabasePath ?? defaultDatabaseFilePath(),
  host: defaultHost,
  logFilePath,
  port: DAEMON_PORT,
});

await daemon.launch();
if (process.env.TWO_PEBBLE_OPEN_UI === '1') {
  Bun.spawn(['open', `http://${daemon.hostname}:${daemon.port}`]);
}

async function shutdown(): Promise<void> {
  await daemon.close();
  process.exit(0);
}

process.on('SIGINT', () => {
  void shutdown();
});
process.on('SIGTERM', () => {
  void shutdown();
});
