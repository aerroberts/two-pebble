/**
 * Defines the CreateSkillOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface CreateSkillOperation {
  name: 'createSkill';
  request: {
    description?: string;
    diskFolderPath: string;
    name?: string;
    projectId?: string;
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
