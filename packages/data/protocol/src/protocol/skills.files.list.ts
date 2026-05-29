/**
 * Defines the SkillFilesListOperation protocol contract for daemon bridge messages.
 * Returns relative paths for files inside the skill folder.
 */
export interface SkillFilesListOperation {
  name: 'listSkillFiles';
  request: {
    skillId: string;
  };
  response: {
    files: string[];
  };
}
