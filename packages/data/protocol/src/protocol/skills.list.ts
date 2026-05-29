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

/**
 * Defines the SkillsListOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface SkillsListOperation {
  name: 'listSkills';
  request: {
    limit?: number;
    offset?: number;
    projectId?: string;
  };
  response: {
    items: SkillRecord[];
    page: {
      limit: number;
      offset: number;
      total: number;
    };
  };
}
