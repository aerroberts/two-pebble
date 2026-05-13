import { RealtimeDaemonConnection } from '../realtime-daemon-connection';
import type { RealtimeConnectionWrapperInput } from './types';

export function RealtimeConnectionWrapper(props: RealtimeConnectionWrapperInput) {
  return (
    <RealtimeDaemonConnection loading={null} notConnected={null} url={props.url}>
      {props.children}
    </RealtimeDaemonConnection>
  );
}
