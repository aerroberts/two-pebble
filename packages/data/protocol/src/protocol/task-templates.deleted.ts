export interface TaskTemplateDeletedEvent {
  name: 'taskTemplateDeleted';
  payload: { id: string };
}
