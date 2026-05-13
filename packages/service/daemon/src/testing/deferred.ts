export interface Deferred<T> {
  promise: Promise<T>;
  reject(reason: Error): void;
  resolve(value: T): void;
}

/**
 * Creates a promise plus explicit resolve and reject callbacks.
 * Test doubles use this to pause async daemon flows deterministically.
 * The callbacks throw if used before promise initialization completes.
 */
export function createDeferred<T>(): Deferred<T> {
  let resolve: Deferred<T>['resolve'] = createUnsetResolve<T>();
  let reject: Deferred<T>['reject'] = createUnsetReject();
  const promise = new Promise<T>((resolveInput, rejectInput) => {
    resolve = (value) => resolveInput(value);
    reject = (reason) => rejectInput(reason);
  });
  return { promise, reject, resolve };
}

function createUnsetResolve<T>() {
  return function unsetResolve(_value: T) {
    throw new Error('Deferred resolve called before initialization.');
  };
}

function createUnsetReject() {
  return function unsetReject(_reason: Error) {
    throw new Error('Deferred reject called before initialization.');
  };
}
