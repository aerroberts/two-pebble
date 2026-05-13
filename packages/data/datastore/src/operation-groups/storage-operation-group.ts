import type { DatastoreOperationBinder } from '../datastore-operation-binder';
import { metricsListNamesOperation } from '../operations/metrics.list-names';
import { metricsListVariantsOperation } from '../operations/metrics.list-variants';
import { metricsQueryAggregatedOperation } from '../operations/metrics.query-aggregated';
import { metricsWriteOperation } from '../operations/metrics.write';
import { repositoriesCreateOperation } from '../operations/repositories.create';
import { repositoriesDeleteOperation } from '../operations/repositories.delete';
import { repositoriesListOperation } from '../operations/repositories.list';
import { repositoriesReadOperation } from '../operations/repositories.read';
import { repositoriesUpdateOperation } from '../operations/repositories.update';
import { threadsListOperation } from '../operations/threads.list';
import { workspacesCreateOperation } from '../operations/workspaces.create';
import { workspacesListOperation } from '../operations/workspaces.list';
import { workspacesReadOperation } from '../operations/workspaces.read';
import { worktreesCreateOperation } from '../operations/worktrees.create';
import { worktreesDeleteOperation } from '../operations/worktrees.delete';
import { worktreesListOperation } from '../operations/worktrees.list';
import { worktreesReadOperation } from '../operations/worktrees.read';
import { worktreesUpdateOperation } from '../operations/worktrees.update';

/**
 * Binds metric persistence handlers.
 *
 * Metrics are raw observations and server-side aggregate queries.
 */
export function bindMetricOperationGroup(bind: DatastoreOperationBinder) {
  return {
    write: bind(metricsWriteOperation, 'metrics.write'),
    listNames: bind(metricsListNamesOperation, 'metrics.list-names'),
    listVariants: bind(metricsListVariantsOperation, 'metrics.list-variants'),
    queryAggregated: bind(metricsQueryAggregatedOperation, 'metrics.query-aggregated'),
  };
}

/**
 * Binds repository persistence handlers.
 *
 * Repositories are pointers to existing local git clones.
 */
export function bindRepositoryOperationGroup(bind: DatastoreOperationBinder) {
  return {
    create: bind(repositoriesCreateOperation, 'repositories.create'),
    delete: bind(repositoriesDeleteOperation, 'repositories.delete'),
    list: bind(repositoriesListOperation, 'repositories.list'),
    read: bind(repositoriesReadOperation, 'repositories.read'),
    update: bind(repositoriesUpdateOperation, 'repositories.update'),
  };
}

/**
 * Binds worktree persistence handlers.
 *
 * Worktrees track lifecycle for daemon-managed git worktrees.
 */
export function bindWorktreeOperationGroup(bind: DatastoreOperationBinder) {
  return {
    create: bind(worktreesCreateOperation, 'worktrees.create'),
    delete: bind(worktreesDeleteOperation, 'worktrees.delete'),
    list: bind(worktreesListOperation, 'worktrees.list'),
    read: bind(worktreesReadOperation, 'worktrees.read'),
    update: bind(worktreesUpdateOperation, 'worktrees.update'),
  };
}

/**
 * Binds workspace persistence handlers.
 *
 * Workspaces describe an on-disk path an agent can operate within.
 */
export function bindWorkspaceOperationGroup(bind: DatastoreOperationBinder) {
  return {
    create: bind(workspacesCreateOperation, 'workspaces.create'),
    list: bind(workspacesListOperation, 'workspaces.list'),
    read: bind(workspacesReadOperation, 'workspaces.read'),
  };
}

/**
 * Binds thread persistence handlers.
 *
 * Threads are conversation cell groupings keyed by thread id.
 */
export function bindThreadOperationGroup(bind: DatastoreOperationBinder) {
  return {
    list: bind(threadsListOperation, 'threads.list'),
  };
}
