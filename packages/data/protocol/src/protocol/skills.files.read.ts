/**
 * Defines the SkillFilesReadOperation protocol contract for daemon bridge messages.
 * `file` is relative to the skill folder; the daemon rejects path escapes.
 */
export interface SkillFilesReadOperation {
  name: 'readSkillFile';
  request: {
    file: string;
    skillId: string;
  };
  response: {
    content: string;
  };
}
