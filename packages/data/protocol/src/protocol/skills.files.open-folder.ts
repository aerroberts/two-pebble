/**
 * Defines the SkillFolderOpenOperation protocol contract for daemon bridge messages.
 * Opens the skill's folder in the host OS file browser.
 */
export interface SkillFolderOpenOperation {
  name: 'openSkillFolder';
  request: {
    skillId: string;
  };
  response: {
    path: string;
  };
}
