/**
 * Defines the UpdateSkillOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface UpdateSkillOperation {
  name: 'updateSkill';
  request: {
    description?: string;
    diskFolderPath?: string;
    id: string;
    name?: string;
  };
  response: SkillRecord;
}

/**
 * Defines the SkillRecord protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface SkillRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  description: string;
  projectId?: string;
  diskFolderPath: string;
}
