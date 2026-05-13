/**
 * Raised when an operation request fails on the remote side of the bridge.
 */
export function bridgeOperationError(message: string) {
  const error = new Error(message);
  error.name = 'BridgeOperationError';
  return error;
}
