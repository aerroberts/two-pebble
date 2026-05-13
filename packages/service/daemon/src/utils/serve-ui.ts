import path from 'node:path';

const UI_DIST_DIRECTORY = path.resolve(import.meta.dirname, '..', '..', '..', '..', 'ui', 'app', 'dist');

/**
 * Returns the absolute path of the directory containing the built UI assets.
 * Resolved from the daemon source so it follows the package, not the cwd.
 * Tests and tools can use it to point a static server at the right folder.
 */
export function uiDistDirectory(): string {
  return UI_DIST_DIRECTORY;
}

/**
 * Serves a request as a static asset from the UI dist directory.
 * Unknown paths fall back to `index.html` so the SPA router handles deep links.
 * Returns undefined when the dist folder has no matching file or fallback.
 */
export async function serveUiRequest(request: Request): Promise<Response | undefined> {
  const url = new URL(request.url);
  const assetResponse = await readUiAsset(url.pathname);
  if (assetResponse !== undefined) return assetResponse;
  return readUiAsset('/index.html');
}

async function readUiAsset(pathname: string): Promise<Response | undefined> {
  const cleaned = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.join(UI_DIST_DIRECTORY, cleaned);
  if (!filePath.startsWith(UI_DIST_DIRECTORY)) return undefined;
  const file = Bun.file(filePath);
  if (!(await file.exists())) return undefined;
  return new Response(file);
}
