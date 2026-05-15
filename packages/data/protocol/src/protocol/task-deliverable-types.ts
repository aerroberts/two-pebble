export type TaskDeliverableType = 'text' | 'pr_url';

export type TaskDeliverablePayload = { type: 'text'; content: string } | { type: 'pr_url'; url: string };

export interface TaskTemplateRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  boardId: string;
  name: string;
  prompt: string;
}

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

export interface TaskDeliverableSubmissionRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  taskId: string;
  deliverableId: string;
  payload: TaskDeliverablePayload;
  submittedAt: number;
}
