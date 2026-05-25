import { DataGrid, Duration, Section, Status } from '@two-pebble/components';
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
      <DataGrid
        data={{
          Provider: props.call.provider,
          Model: props.call.modelId,
          Duration: <Duration start={props.call.startedAt} end={getModelCallDurationEnd(props.call)} />,
          Pricing: 'To be determined',
          'Thread Snapshot': (
            <button
              type="button"
              className="text-accent hover:underline"
              onClick={() => props.onOpenThreadSnapshot(props.call.threadCellPointer)}
            >
              Open
            </button>
          ),
        }}
      />
    </Section>
  );
}
