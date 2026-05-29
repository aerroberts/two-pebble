export interface SkillReferenceCellInput {
  skillId: string;
  name: string;
  /** Filled at resolve from the skill record. */
  description?: string;
  /** Filled at resolve: the absolute folder path on disk. */
  diskFolderPath?: string;
  /** Filled at resolve: top-level filenames in the folder, capped. */
  files?: string[];
}

/**
 * A reference to a Skill. At compose time only `skillId`/`name` are known;
 * the daemon resolve layer fills `description`, `diskFolderPath`, and the
 * folder `files` listing fresh every turn.
 */
/**
 * Renders a resolved skill reference as the text block injected into model
 * context. Shared by `serialize` and the per-framework `cell-to-string`
 * renderers so the wording stays in one place. Fields the resolve layer
 * could not fill degrade to empty rather than throwing.
 */
export function renderSkillReferenceText(content: SkillReferenceCellInput): string {
  const description = content.description ?? '';
  const folder = content.diskFolderPath ?? '';
  const files = content.files ?? [];
  const header = description.length > 0 ? `[skill: ${content.name}] ${description}` : `[skill: ${content.name}]`;
  return [header, `Folder (read/run with workspace tools): ${folder}`, `Files: ${files.join(', ')}`].join('\n');
}

export function skillReference(input: SkillReferenceCellInput) {
  return {
    type: 'skillReference' as const,
    content: {
      skillId: input.skillId,
      name: input.name,
      ...(input.description === undefined ? {} : { description: input.description }),
      ...(input.diskFolderPath === undefined ? {} : { diskFolderPath: input.diskFolderPath }),
      ...(input.files === undefined ? {} : { files: input.files }),
    },
  };
}
