import type { LoadableInput, LoadableStatus } from './types';

/**
 * Represents a readonly value that may still be loading.
 * State transitions return new instances instead of mutating existing state.
 * Zustand can then compare object identity and publish precise updates.
 */
export class Loadable<TValue> {
  public readonly status: LoadableStatus;
  public readonly value: TValue | null;

  public constructor(input: LoadableInput<TValue>) {
    this.status = input.status;
    this.value = input.value;
  }

  /**
   * Returns this loadable with a different status.
   * The current value is preserved for loading and error transitions.
   * Callers can keep stale data visible while a refresh is in flight.
   */
  public withStatus(status: LoadableStatus): Loadable<TValue> {
    return new Loadable({ status, value: this.value });
  }

  /**
   * Returns this loadable with a new ready value.
   * Value changes mark the object ready because data is now present.
   * The original instance remains unchanged.
   */
  public withValue(value: TValue): Loadable<TValue> {
    return new Loadable({ status: 'ready', value });
  }
}
