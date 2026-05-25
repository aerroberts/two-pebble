import { AgentPriceLineItemList, AgentPriceTotal, Section, Surface } from '@two-pebble/components';
import type { AgentPriceLineItemRecord } from '@two-pebble/realtime';

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
      <Section title="Total Price">
        <Surface>
          <AgentPriceTotal lineItems={props.lineItems} />
        </Surface>
      </Section>
      <Section title="Line Items">
        <Surface>
          <AgentPriceLineItemList lineItems={props.lineItems} />
        </Surface>
      </Section>
    </>
  );
}
