import type { HeartbeatRecord } from './heartbeats.list';

/**
 * Defines the HeartbeatRecordedEvent protocol contract for daemon bridge messages.
 * Request and response fields stay explicit so callers can rely on the wire shape.
 */
export interface HeartbeatRecordedEvent {
  name: 'heartbeatRecorded';
  payload: HeartbeatRecord;
}
