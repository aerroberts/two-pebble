import { useRealtimeDatastore } from '../hooks/use-realtime-datastore.hook';
import type { HookProbeInput } from './types';

export function HookProbe<TValue>(props: HookProbeInput<TValue>) {
  const datastore = useRealtimeDatastore();
  const value = props.hook();

  props.onDatastore(datastore);
  props.onValue(value);

  return null;
}
