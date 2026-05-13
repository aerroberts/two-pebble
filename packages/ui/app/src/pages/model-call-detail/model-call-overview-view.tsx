import { DataValue, Duration, Section, Status, Surface } from '@two-pebble/components';
import type { AgentCallRecord, AgentCallSummaryRecord } from '@two-pebble/realtime';
import { modelCallStatus } from './model-call-detail.types';
import { getModelCallDurationEnd } from './model-call-detail-format';

interface ModelCallOverviewViewProps {
  call: AgentCallRecord | AgentCallSummaryRecord;
  onOpenThreadSnapshot: (threadPointer: string) => void;
}

export function ModelCallOverviewView(props: ModelCallOverviewViewProps) {
  return (
    <Section
      actionItems={<Status state={modelCallStatus[props.call.status]} label={props.call.status} />}
      title="Overview"
    >
      <Surface>
        <DataValue title="Provider" value={props.call.provider} />
        <DataValue title="Model" value={props.call.modelId} />
        <DataValue
          title="Duration"
          value={<Duration start={props.call.startedAt} end={getModelCallDurationEnd(props.call)} />}
        />
        <DataValue title="Pricing" value="To be determined" />
        <DataValue
          title="Thread Snapshot"
          value="Open"
          onClick={() => props.onOpenThreadSnapshot(props.call.threadCellPointer)}
        />
      </Surface>
    </Section>
  );
}
