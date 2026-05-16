/**
 * Defines the TaskDeliverableType protocol alias shared across daemon bridge messages.
 * Keep this exported type explicit so consumers can rely on the wire shape.
 */
export type TaskDeliverableType = 'text' | 'pr_url';

/**
 * Defines the TaskDeliverablePayload protocol alias shared across daemon bridge messages.
 * Keep this exported type explicit so consumers can rely on the wire shape.
 */
export type TaskDeliverablePayload = { type: 'text'; content: string } | { type: 'pr_url'; url: string };

/**
 * Defines the TaskTemplateRecord protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskTemplateRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  boardId: string;
  name: string;
  prompt: string;
}

/**
 * Defines the TaskTemplateDeliverableRecord protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskTemplateDeliverableRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  templateId: string;
  name: string;
  description: string;
  type: TaskDeliverableType;
  orderIndex: number;
}

/**
 * Defines the TaskDeliverableRecord protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskDeliverableRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  taskId: string;
  name: string;
  description: string;
  type: TaskDeliverableType;
  orderIndex: number;
}

/**
 * Defines the TaskDeliverableSubmissionRecord protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface TaskDeliverableSubmissionRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  taskId: string;
  deliverableId: string;
  payload: TaskDeliverablePayload;
  submittedAt: number;
}
