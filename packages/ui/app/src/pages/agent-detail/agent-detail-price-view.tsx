'use client';

import {
  AgentPriceLineItemList,
  AgentPriceSummary,
  AgentPriceTotal,
  ButtonGroup,
  type PriceChartMode,
  priceChartModeOptions,
  Section,
  Surface,
} from '@two-pebble/components';
import { useState } from 'react';
import type { AgentPriceLineItem } from './agent-detail-price-data';

export interface AgentDetailPriceViewProps {
  lineItems: AgentPriceLineItem[];
  loading: boolean;
  startTime?: number;
  endTime?: number;
}

export function AgentDetailPriceView(props: AgentDetailPriceViewProps) {
  const [chartMode, setChartMode] = useState<PriceChartMode>('price');

  if (props.loading && props.lineItems.length === 0) {
    return (
      <Section>
        <Surface>Loading price line items.</Surface>
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
      <Section
        title="Price Over Time"
        actionItems={
          <ButtonGroup options={priceChartModeOptions} value={chartMode} onChange={setPriceChartMode(setChartMode)} />
        }
      >
        <Surface>
          <AgentPriceSummary
            chartMode={chartMode}
            endTime={props.endTime}
            lineItems={props.lineItems}
            startTime={props.startTime}
          />
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

type SetPriceChartMode = (mode: PriceChartMode) => void;

function setPriceChartMode(setMode: SetPriceChartMode) {
  return (value: string) => {
    if (value === 'price' || value === 'quantity') {
      setMode(value);
    }
  };
}
