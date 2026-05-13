import type { AgentCallRecord, AgentCallSummaryRecord, AgentPriceLineItemRecord } from '@two-pebble/realtime';
import type { ModelCallData } from './model-call-data';
import type { ModelCallViewMode } from './model-call-detail.types';
import { ModelCallOverviewView } from './model-call-overview-view';
import { ModelCallPriceView } from './model-call-price-view';
import { ModelCallRawView } from './model-call-raw-view';
import { ModelCallResponseView } from './model-call-response-view';

interface ModelCallDetailContentProps {
  call: AgentCallRecord | AgentCallSummaryRecord;
  data: ModelCallData | null;
  mode: ModelCallViewMode;
  onOpenThreadSnapshot: (threadPointer: string) => void;
  priceLineItems: AgentPriceLineItemRecord[];
  priceLineItemsLoading: boolean;
}

export function ModelCallDetailContent(props: ModelCallDetailContentProps) {
  switch (props.mode) {
    case 'raw':
      return <ModelCallRawView data={props.data} />;
    case 'price':
      return <ModelCallPriceView lineItems={props.priceLineItems} loading={props.priceLineItemsLoading} />;
    case 'overview':
      return (
        <>
          <ModelCallOverviewView call={props.call} onOpenThreadSnapshot={props.onOpenThreadSnapshot} />
          <ModelCallResponseView data={props.data} />
        </>
      );
  }
}
