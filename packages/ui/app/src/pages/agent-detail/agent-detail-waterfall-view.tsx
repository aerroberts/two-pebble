import { ButtonGroup, Section, Surface, TimelineChart, type TimelineChartItem } from '@two-pebble/components';

export type WaterfallScope = 'all-children' | 'this-agent';

export interface AgentDetailWaterfallViewProps {
  items: TimelineChartItem[];
  nowTimestamp: number;
  onModelCallClick: (modelCallId: string) => void;
  onScopeChange: (scope: WaterfallScope) => void;
  scope: WaterfallScope;
}

export function AgentDetailWaterfallView(props: AgentDetailWaterfallViewProps) {
  return (
    <Section
      title="Waterfall"
      actionItems={<ButtonGroup options={waterfallScopeOptions} value={props.scope} onChange={setScope(props)} />}
    >
      <Surface>
        <TimelineChart
          emptyMessage="No model call, tool, or sub-agent timing data."
          gridIntervalMs={1000}
          height={Math.max(140, Math.min(720, props.items.length * 24 + 56))}
          items={props.items}
          nowTimestamp={props.nowTimestamp}
          onItemClick={(item) => {
            if (item.category === 'Model Calls') {
              props.onModelCallClick(item.id.replace(/^model-call:/, ''));
            }
          }}
          showVerticalLines={false}
        />
      </Surface>
    </Section>
  );
}

const waterfallScopeOptions = [
  { value: 'this-agent', label: 'This Agent' },
  { value: 'all-children', label: 'All Children' },
];

function setScope(props: AgentDetailWaterfallViewProps) {
  return (value: string) => {
    if (value === 'this-agent' || value === 'all-children') {
      props.onScopeChange(value);
    }
  };
}
