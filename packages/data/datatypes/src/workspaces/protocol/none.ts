/**
 * Workspace config that intentionally attaches no workspace path.
 * Pebble-only — framework agents (Claude Code) require a real cwd, so
 * the daemon rejects this kind for framework registries at launch.
 */
export interface WorkspaceConfig_None {
  kind: 'none';
}
