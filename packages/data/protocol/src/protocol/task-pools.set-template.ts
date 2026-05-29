/**
 * Defines the TaskPoolsSetTemplateOperation protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskPoolsSetTemplateOperation {
  name: 'setTaskPoolTemplate';
  request: {
    id: string;
    defaultTemplateId: string | null;
  };
  response: {
    id: string;
  };
}
