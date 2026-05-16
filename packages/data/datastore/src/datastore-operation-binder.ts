import type { Wrappable } from './types';

/**
 * Exposes this datastore module contract for package-local callers.
 */
export type DatastoreOperationBinder = <T>(handler: Wrappable<T>, operation: string) => T;
