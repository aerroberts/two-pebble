import { CodeBlock, DataValue, Section, Surface } from '@two-pebble/components';
import type { AgentPriceLineItemRecord } from '@two-pebble/realtime';
import { formatUsd } from './model-call-detail-format';

interface ModelCallPriceViewProps {
  lineItems: AgentPriceLineItemRecord[];
  loading: boolean;
}

export function ModelCallPriceView(props: ModelCallPriceViewProps) {
  if (props.loading) {
    return (
      <Section>
        <Surface>Loading model call price data.</Surface>
      </Section>
    );
  }

  if (props.lineItems.length === 0) {
    return (
      <Section title="Price">
        <Surface>No price line items.</Surface>
      </Section>
    );
  }

  return (
    <>
      <Section title="Price">
        <Surface>
          <DataValue title="Line Items" value={props.lineItems.length} />
          <DataValue title="Total" value={formatUsd(props.lineItems.reduce((total, item) => total + item.total, 0))} />
        </Surface>
      </Section>
      <Section title="Line Items">
        <CodeBlock content={JSON.stringify(props.lineItems, null, 2)} language="json" />
      </Section>
    </>
  );
}
