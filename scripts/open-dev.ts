const HOST = process.env.TWO_PEBBLE_HOST ?? '127.0.0.1';
const START_PORT = Number(process.env.TWO_PEBBLE_PORT ?? '49152');
const PORT_RANGE = 100;
const RETRIES = 80;
const RETRY_DELAY_MS = 250;

async function main() {
  const url = await waitForDaemonUrl();
  await openUrl(url);
}

async function waitForDaemonUrl(): Promise<string> {
  for (let attempt = 0; attempt < RETRIES; attempt += 1) {
    const url = await findDaemonUrl();
    if (url !== undefined) return url;
    await Bun.sleep(RETRY_DELAY_MS);
  }

  throw new Error(`Could not find a local Two Pebble daemon on ${HOST}:${START_PORT}-${START_PORT + PORT_RANGE - 1}`);
}

async function findDaemonUrl(): Promise<string | undefined> {
  for (let offset = 0; offset < PORT_RANGE; offset += 1) {
    const port = START_PORT + offset;
    const url = `http://${HOST}:${port}`;
    if (await isDaemonReady(url)) return url;
  }
  return undefined;
}

async function isDaemonReady(url: string): Promise<boolean> {
  try {
    const response = await fetch(`${url}/health`);
    if (!response.ok) return false;
    const body = (await response.json()) as { state?: string };
    return body.state === 'ready';
  } catch {
    return false;
  }
}

async function openUrl(url: string): Promise<void> {
  console.log(`Opening ${url}`);
  const command = process.platform === 'darwin' ? 'open' : 'xdg-open';
  try {
    const processHandle = Bun.spawn([command, url], { stderr: 'ignore', stdout: 'ignore' });
    await processHandle.exited;
  } catch {
    console.log(`Open ${url} in your browser.`);
  }
}

await main();
