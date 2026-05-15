import type { RealtimeOperationContext } from '../../types';

/**
 * Wires the realtime client to every task event the daemon emits.
 * Each handler patches the corresponding loadable registry so React hooks
 * see fresh state without manually re-listing.
 */
export function listenToTasks(ctx: RealtimeOperationContext): void {
  const client = ctx.datastore.client;
  if (client === null) {
    return;
  }

  client.listen('taskBoardUpdated', (record) => {
    ctx.datastore.patch({ taskBoards: ctx.datastore.state.taskBoards.withItem(record.id, record, 'ready') });
  });
  client.listen('taskBoardDeleted', (deleted) => {
    ctx.datastore.patch({ taskBoards: ctx.datastore.state.taskBoards.withoutItem(deleted.id) });
  });
  client.listen('taskPoolUpdated', (record) => {
    ctx.datastore.patch({ taskPools: ctx.datastore.state.taskPools.withItem(record.id, record, 'ready') });
  });
  client.listen('taskPoolDeleted', (deleted) => {
    ctx.datastore.patch({ taskPools: ctx.datastore.state.taskPools.withoutItem(deleted.id) });
  });
  client.listen('taskUpdated', (record) => {
    ctx.datastore.patch({ tasks: ctx.datastore.state.tasks.withItem(record.id, record, 'ready') });
  });
  client.listen('taskDeleted', (deleted) => {
    ctx.datastore.patch({ tasks: ctx.datastore.state.tasks.withoutItem(deleted.id) });
  });
  client.listen('taskDependencyUpdated', (record) => {
    ctx.datastore.patch({
      taskDependencies: ctx.datastore.state.taskDependencies.withItem(record.id, record, 'ready'),
    });
  });
  client.listen('taskDependencyDeleted', (deleted) => {
    const key = `${deleted.fromId}:${deleted.toId}`;
    const all = ctx.datastore.state.taskDependencies;
    const matching = all.values().find((edge) => edge.fromId === deleted.fromId && edge.toId === deleted.toId);
    if (matching === undefined) {
      return;
    }
    ctx.datastore.patch({ taskDependencies: all.withoutItem(matching.id) });
    void key;
  });
  client.listen('taskEventRecorded', (record) => {
    ctx.datastore.patch({
      taskEvents: ctx.datastore.state.taskEvents.withItem(record.id, record, 'ready'),
    });
  });
  client.listen('taskTemplateUpdated', (record) => {
    ctx.datastore.patch({ taskTemplates: ctx.datastore.state.taskTemplates.withItem(record.id, record, 'ready') });
  });
  client.listen('taskTemplateDeleted', (deleted) => {
    ctx.datastore.patch({ taskTemplates: ctx.datastore.state.taskTemplates.withoutItem(deleted.id) });
  });
  client.listen('taskTemplateDeliverableUpdated', (record) => {
    ctx.datastore.patch({
      taskTemplateDeliverables: ctx.datastore.state.taskTemplateDeliverables.withItem(record.id, record, 'ready'),
    });
  });
  client.listen('taskTemplateDeliverableDeleted', (deleted) => {
    ctx.datastore.patch({
      taskTemplateDeliverables: ctx.datastore.state.taskTemplateDeliverables.withoutItem(deleted.id),
    });
  });
  client.listen('taskDeliverableUpdated', (record) => {
    ctx.datastore.patch({
      taskDeliverables: ctx.datastore.state.taskDeliverables.withItem(record.id, record, 'ready'),
    });
  });
  client.listen('taskDeliverableSubmissionRecorded', (record) => {
    ctx.datastore.patch({
      taskDeliverableSubmissions: ctx.datastore.state.taskDeliverableSubmissions.withItem(record.id, record, 'ready'),
    });
  });
}
