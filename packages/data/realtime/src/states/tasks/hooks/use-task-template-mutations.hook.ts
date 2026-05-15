'use client';

import { useRealtimeDatastore } from '../../../hooks/use-realtime-datastore.hook';
import type {
  CreateTaskTemplateDeliverableInput,
  CreateTaskTemplateInput,
  DeleteTaskTemplateDeliverableInput,
  DeleteTaskTemplateInput,
  UpdateTaskTemplateDeliverableInput,
  UpdateTaskTemplateInput,
} from '../types';

export function useTaskTemplateMutations() {
  const datastore = useRealtimeDatastore();
  return {
    createTemplate: (input: CreateTaskTemplateInput) => datastore.taskTemplates.create(input),
    updateTemplate: (input: UpdateTaskTemplateInput) => datastore.taskTemplates.update(input),
    deleteTemplate: (input: DeleteTaskTemplateInput) => datastore.taskTemplates.delete(input),
    createDeliverable: (input: CreateTaskTemplateDeliverableInput) =>
      datastore.taskTemplates.deliverables.create(input),
    updateDeliverable: (input: UpdateTaskTemplateDeliverableInput) =>
      datastore.taskTemplates.deliverables.update(input),
    deleteDeliverable: (input: DeleteTaskTemplateDeliverableInput) =>
      datastore.taskTemplates.deliverables.delete(input),
  };
}
