import type { Wrappable } from './types';

export type DatastoreOperationBinder = <T>(handler: Wrappable<T>, operation: string) => T;
