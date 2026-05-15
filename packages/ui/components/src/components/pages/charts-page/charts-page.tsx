import { Heatmap } from '../../charts/heatmap/heatmap';
import { ProportionalBarChart } from '../../charts/proportional-bar-chart/proportional-bar-chart';
import { SankeyChart } from '../../charts/sankey-chart/sankey-chart';
import { StackedTimelineBarChart } from '../../charts/stacked-timeline-bar-chart/stacked-timeline-bar-chart';
import { TimelineChart } from '../../charts/timeline-chart/timeline-chart';
import { CHART_COLORS } from '../../charts/utils/chart-colors';
import { WorkflowFlowChart } from '../../charts/workflow-flow-chart/workflow-flow-chart';
import { Header } from '../../content/header/header';
import { Section } from '../../content/section/section';
import { DataValue } from '../../data/data-value/data-value';
import { SidebarLayout } from '../../layout/sidebar-layout/sidebar-layout';
import { Sidebar } from '../../navigation/sidebar/sidebar';
import { SidebarOption } from '../../navigation/sidebar-option/sidebar-option';
import { SidebarSection } from '../../navigation/sidebar-section/sidebar-section';

const baseTime = Date.UTC(2026, 3, 28, 9, 0, 0);

const timelineItems = [
  {
    id: 'ingest',
    label: 'Message intake',
    category: 'Runtime',
    startTime: baseTime,
    endTime: baseTime + 90_000,
    status: 'success' as const,
  },
  {
    id: 'plan',
    label: 'Plan',
    category: 'Agent',
    startTime: baseTime + 70_000,
    endTime: baseTime + 220_000,
    status: 'success' as const,
  },
  {
    id: 'tools',
    label: 'Tool calls',
    category: 'Tools',
    startTime: baseTime + 180_000,
    endTime: baseTime + 430_000,
    status: 'in-progress' as const,
  },
  {
    id: 'answer',
    label: 'Answer',
    category: 'Agent',
    startTime: baseTime + 390_000,
    endTime: baseTime + 560_000,
    status: 'default' as const,
  },
];

const timelineRangeOptions = [
  { label: '2M', start: baseTime, stop: baseTime + 2 * 60_000 },
  { label: '5M', start: baseTime, stop: baseTime + 5 * 60_000 },
  { label: 'All', start: baseTime, stop: baseTime + 620_000 },
];

const stackedSeries = [
  { id: 'prompt', label: 'Prompt', color: CHART_COLORS.blue },
  { id: 'completion', label: 'Completion', color: CHART_COLORS.green },
  { id: 'tool', label: 'Tool', color: CHART_COLORS.purple },
];

const stackedPoints = [
  { timestamp: baseTime, seriesId: 'prompt', value: 32 },
  { timestamp: baseTime, seriesId: 'completion', value: 14 },
  { timestamp: baseTime + 60_000, seriesId: 'prompt', value: 44 },
  { timestamp: baseTime + 60_000, seriesId: 'tool', value: 12 },
  { timestamp: baseTime + 120_000, seriesId: 'completion', value: 28 },
  { timestamp: baseTime + 180_000, seriesId: 'prompt', value: 26 },
  { timestamp: baseTime + 180_000, seriesId: 'tool', value: 34 },
  { timestamp: baseTime + 240_000, seriesId: 'completion', value: 38 },
  { timestamp: baseTime + 300_000, seriesId: 'prompt', value: 18 },
  { timestamp: baseTime + 300_000, seriesId: 'completion', value: 42 },
];

const proportionalItems = [
  { label: 'Reasoning', value: 42, color: CHART_COLORS.indigo },
  { label: 'Tools', value: 28, color: CHART_COLORS.cyan },
  { label: 'Serialization', value: 18, color: CHART_COLORS.amber },
  { label: 'Idle', value: 12, color: CHART_COLORS.slate },
];

const heatmapHorizontalLabels = ['Plan', 'Model', 'Tool', 'Write', 'Verify', 'Commit'];

const heatmapVerticalLabels = [
  { id: 'mon', label: 'Mon' },
  { id: 'tue', label: 'Tue' },
  { id: 'wed', label: 'Wed' },
  { id: 'thu', label: 'Thu' },
  { id: 'fri', label: 'Fri' },
];

const heatmapData = heatmapVerticalLabels.flatMap((row, rowIndex) =>
  heatmapHorizontalLabels.map((column, columnIndex) => ({
    x: column,
    y: row.id,
    value: ((rowIndex + 3) * (columnIndex + 2)) % 17,
    label: `${row.label} ${column}`,
  })),
);

const sankeyStages = [
  {
    header: 'Input',
    links: [
      { from: 'User', to: 'Planner', count: 72 },
      { from: 'System', to: 'Planner', count: 28 },
    ],
  },
  {
    header: 'Work',
    links: [
      { from: 'Planner', to: 'Model', count: 54 },
      { from: 'Planner', to: 'Tools', count: 32 },
      { from: 'Planner', to: 'Cache', count: 14 },
    ],
  },
  {
    header: 'Output',
    links: [
      { from: 'Model', to: 'Answer', count: 48 },
      { from: 'Tools', to: 'Answer', count: 27 },
      { from: 'Cache', to: 'Answer', count: 11 },
    ],
  },
];

const workflowNodes = [
  { id: 'thread', title: 'Thread', subtitle: 'Cells', icon: 'messages-square' },
  { id: 'parser', title: 'Parser', subtitle: 'Tool format', icon: 'braces' },
  { id: 'agent', title: 'Agent', subtitle: 'Loop', icon: 'bot', selected: true },
  { id: 'provider', title: 'Provider', subtitle: 'OpenAI', icon: 'plug' },
  { id: 'trace', title: 'Trace', subtitle: 'Stored', icon: 'activity' },
];

function ChartsSidebar() {
  return (
    <Sidebar brandingTitle="Charts">
      <SidebarSection title="Dashboards">
        <SidebarOption active label="Overview" />
        <SidebarOption label="Runtime" />
        <SidebarOption label="Cost" />
      </SidebarSection>
    </Sidebar>
  );
}

export function ChartsPage() {
  return (
    <SidebarLayout sidebar={<ChartsSidebar />}>
      <main className="overflow-auto px-8 py-6">
        <Header subtitle="Runtime signals, flow, and volume across a single agent workspace.">Charts</Header>
        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-md bg-surface p-4">
            <DataValue title="Runs" value="42" />
          </div>
          <div className="rounded-md bg-surface p-4">
            <DataValue title="Model calls" value="128" />
          </div>
          <div className="rounded-md bg-surface p-4">
            <DataValue title="Tool calls" value="311" />
          </div>
          <div className="rounded-md bg-surface p-4">
            <DataValue title="Avg latency" value="820 ms" />
          </div>
        </div>
        <Section title="Timeline">
          <div className="rounded-md bg-surface p-4">
            <TimelineChart
              defaultRangeLabel="All"
              height={220}
              items={timelineItems}
              nowTimestamp={baseTime + 620_000}
              rangeOptions={timelineRangeOptions}
            />
          </div>
        </Section>
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Section title="Token Volume">
            <div className="rounded-md bg-surface p-4">
              <StackedTimelineBarChart height={240} points={stackedPoints} series={stackedSeries} />
            </div>
          </Section>
          <Section title="Work Split">
            <div className="rounded-md bg-surface p-4">
              <ProportionalBarChart items={proportionalItems} />
            </div>
          </Section>
        </div>
        <Section title="Activity">
          <div className="rounded-md bg-surface p-4">
            <Heatmap
              cellColor={CHART_COLORS.blue}
              data={heatmapData}
              horizontalLabels={heatmapHorizontalLabels}
              verticalLabels={heatmapVerticalLabels}
            />
          </div>
        </Section>
        <Section title="Flow">
          <div className="rounded-md bg-surface p-4">
            <SankeyChart stages={sankeyStages} />
          </div>
        </Section>
        <Section title="Workflow">
          <div className="rounded-md bg-surface p-4">
            <WorkflowFlowChart nodes={workflowNodes} />
          </div>
        </Section>
      </main>
    </SidebarLayout>
  );
}
