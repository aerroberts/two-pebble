import type { HeartbeatRecord } from './heartbeats.list';

export interface HeartbeatRecordedEvent {
  name: 'heartbeatRecorded';
  payload: HeartbeatRecord;
}
