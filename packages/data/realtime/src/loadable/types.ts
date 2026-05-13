import type { Loadable } from './loadable';

export type LoadableStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface LoadableInput<TValue> {
  status: LoadableStatus;
  value: TValue | null;
}

export type LoadableRegistryValue<TValue> = Map<string, Loadable<TValue>>;

export interface LoadableRegistryItem<TValue> {
  id: string;
  status: LoadableStatus;
  value: TValue;
}

export type LoadableRegistryReadyItem<TValue> = TValue & {
  id: string;
};
