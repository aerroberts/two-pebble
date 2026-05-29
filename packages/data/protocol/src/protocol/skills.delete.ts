/**
 * Defines the DeleteSkillOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface DeleteSkillOperation {
  name: 'deleteSkill';
  request: {
    id: string;
  };
  response: {
    id: string;
  };
}
