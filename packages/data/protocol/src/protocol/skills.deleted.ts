/**
 * Defines the SkillDeletedEvent protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface SkillDeletedEvent {
  name: 'skillDeleted';
  payload: {
    id: string;
  };
}
