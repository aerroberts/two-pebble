import type { Agent, PebbleJsonRecord } from '@two-pebble/pebble';

interface ResumeMetadataProvider {
  getResumeMetadata(): PebbleJsonRecord;
}

export function readResumeMetadata(agent: Agent): PebbleJsonRecord {
  if ('getResumeMetadata' in agent && typeof agent.getResumeMetadata === 'function') {
    return (agent as Agent & ResumeMetadataProvider).getResumeMetadata();
  }
  return {};
}
