import type { DaemonBridge } from '../types';
import type { MulticastBridge } from './multicast-bridge';

export function asDaemonBridge(multicast: MulticastBridge): DaemonBridge {
  return multicast as never;
}
