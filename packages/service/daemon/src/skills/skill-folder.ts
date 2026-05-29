import nodeFs from 'node:fs';
import path from 'node:path';

/**
 * Upper bound on the number of entries returned for a skill folder listing.
 * The listing is injected verbatim into model context, so it must stay
 * bounded regardless of how large the folder is.
 */
export const MAX_ENTRIES = 200;

/**
 * Minimal filesystem surface this module needs. Injectable so tests can
 * exercise the path-escape and cap logic without touching real disk.
 */
export interface SkillFolderFs {
  statSync(target: string): { isDirectory(): boolean };
  readdirSync(target: string, options: { withFileTypes: true }): SkillFolderDirent[];
}

export interface SkillFolderDirent {
  name: string;
}

/**
 * Validates that `root` points at an existing directory. Throws on a
 * non-absolute path, a path containing `..` traversal segments, a missing
 * target, or a target that is not a directory. Returns the normalized
 * absolute path on success.
 *
 * This is the single enforcement boundary for skill folder access — the
 * datastore never touches disk, and only the daemon resolve layer lists a
 * folder (and only its entry names, never file bodies).
 */
export function validateSkillFolder(root: string, fs: SkillFolderFs = nodeFs): string {
  if (!path.isAbsolute(root)) {
    throw new Error(`Skill folder path must be absolute: ${root}`);
  }
  // Inspect the RAW input before normalizing — `path.normalize` collapses
  // `..` segments, which would let a traversal slip through silently.
  if (root.split(/[/\\]/).includes('..')) {
    throw new Error(`Skill folder path must not contain '..' segments: ${root}`);
  }
  const normalized = path.normalize(root);

  let stats: { isDirectory(): boolean };
  try {
    stats = fs.statSync(normalized);
  } catch {
    throw new Error(`Skill folder does not exist: ${root}`);
  }
  if (!stats.isDirectory()) {
    throw new Error(`Skill folder is not a directory: ${root}`);
  }
  return normalized;
}

/**
 * Returns a SHALLOW listing of the skill folder: top-level entry names,
 * skipping dot-entries and `node_modules`, capped at {@link MAX_ENTRIES}.
 * Never reads file bodies — the model pulls those itself via its workspace
 * tools against the folder path.
 */
export function listSkillFolder(root: string, fs: SkillFolderFs = nodeFs): string[] {
  const normalized = validateSkillFolder(root, fs);
  const entries = fs.readdirSync(normalized, { withFileTypes: true });
  const names: string[] = [];
  for (const entry of entries) {
    const name = entry.name;
    if (name.startsWith('.') || name === 'node_modules') {
      continue;
    }
    // Defense: a name that smuggles in separators or traversal would let a
    // listing escape the folder root. Drop it rather than surface it.
    if (name.includes('/') || name.includes('\\') || name.includes('..')) {
      continue;
    }
    names.push(name);
  }
  return names.sort((left, right) => left.localeCompare(right)).slice(0, MAX_ENTRIES);
}
