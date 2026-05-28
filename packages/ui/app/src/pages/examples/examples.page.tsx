import { Header, ListLayout, PageLayout, Section } from '@two-pebble/components';
import { Navigate, useParams } from 'react-router-dom';

interface ExampleEntry {
  title: string;
  description: string;
}

interface ExampleSection {
  title: string;
  subtitle: string;
  features: ExampleEntry[];
}

export interface ExampleDocPage {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  sections: ExampleSection[];
}

export const EXAMPLE_DOC_PAGES: ExampleDocPage[] = [
  {
    id: 'agents',
    title: 'Agents',
    subtitle: 'Run, observe, and steer coding agents from a single chat surface.',
    icon: 'bot',
    sections: [
      {
        title: 'Chat Workflow',
        subtitle: 'The day-to-day controls for launching and steering agent work.',
        features: [
          {
            title: 'Agent chat assistant',
            description:
              'Conversational workspace for launching and steering agents. Compose rich messages with @-mentions for documents, tasks, and boards.',
          },
          {
            title: 'Conversation folding',
            description:
              'Collapse long agent runs into compact summaries so the chat view stays readable. Toggle the behavior from chat settings.',
          },
          {
            title: 'Queued follow-up messages',
            description:
              'Stack additional prompts while an agent is still running. Each follow-up is delivered in order once the current step finishes.',
          },
        ],
      },
      {
        title: 'Run Intelligence',
        subtitle: 'Inspect how agents execute work and what each run costs.',
        features: [
          {
            title: 'Agent trace and run timeline',
            description:
              'Live trace of every step an agent takes, including tool calls, model calls, and status updates with duration metrics.',
          },
          {
            title: 'Agent pricing summary',
            description:
              'Line-item breakdown of model usage and cost per agent run, with chart and list views for token and dollar totals.',
          },
          {
            title: 'Third-party agent registries',
            description:
              'Register external agent providers (Claude Code, Codex, custom runners) and pick which one services a chat.',
          },
        ],
      },
    ],
  },
  {
    id: 'documents',
    title: 'Documents',
    subtitle: 'Long-form, agent-aware editing built on a TipTap surface.',
    icon: 'file-text',
    sections: [
      {
        title: 'Editing',
        subtitle: 'Write structured documents that agents and humans can both work with.',
        features: [
          {
            title: 'Rich document editor',
            description:
              'TipTap-based editor with slash commands, mentions, todos, tables, and Markdown import/export for agent-authored content.',
          },
          {
            title: 'Syntax-highlighted code blocks',
            description:
              'tsx, jsx, and other languages render with syntax highlighting. Spellcheck is disabled inside code blocks so identifiers do not get underlined.',
          },
          {
            title: 'Cell-level comments',
            description:
              'Leave threaded comments on individual document cells. Comments open in a popover anchored to the cell.',
          },
        ],
      },
      {
        title: 'Organization And Agents',
        subtitle: 'Keep documents grouped and hand them directly to configured runners.',
        features: [
          {
            title: 'Document sections',
            description:
              'Group related documents under named sections in the sidebar and switch sections from the document header dropdown.',
          },
          {
            title: 'Agent-managed sections',
            description:
              'Agents can set or change a document section through the write and update document tools, keeping the sidebar organized automatically.',
          },
          {
            title: 'Send-to-agent button',
            description:
              'Hand a document straight to a configured runner from the document header. Pick the default agent in document runner settings.',
          },
        ],
      },
    ],
  },
  {
    id: 'tasks',
    title: 'Tasks',
    subtitle: 'Plan, dispatch, and track work across boards and dependency graphs.',
    icon: 'list-todo',
    sections: [
      {
        title: 'Planning',
        subtitle: 'Break work into boards, templates, and dependency-aware task graphs.',
        features: [
          {
            title: 'Task boards',
            description:
              'Bordered list of task boards on /tasks. Each board owns its own task list, settings, and default template.',
          },
          {
            title: 'Default task template',
            description:
              'Boards carry a configurable default template so new tasks start with a consistent prompt scaffold.',
          },
          {
            title: 'Task graph and dependency view',
            description:
              'Visualize task dependencies and pools so agents can pick up unblocked work in the right order.',
          },
        ],
      },
      {
        title: 'Execution',
        subtitle: 'Track assigned work and the artifacts produced by agents.',
        features: [
          {
            title: 'Task detail sidebar',
            description:
              'Drawer with task metadata, deliverables, status controls, and the linked chat surface for the assigned agent.',
          },
          {
            title: 'Deliverables drawer',
            description:
              'Inspect, browse, and copy deliverables produced by agents directly from the task detail surface.',
          },
        ],
      },
    ],
  },
  {
    id: 'workspace',
    title: 'Workspace',
    subtitle: 'Project scope, repository connections, and local editor bridges.',
    icon: 'folder-open',
    sections: [
      {
        title: 'Projects',
        subtitle: 'Scope the entire workspace to a single project context.',
        features: [
          {
            title: 'Project scoping',
            description:
              'Routes, sidebars, and realtime hooks scope to the active project. Switch projects from the picker in the top-left.',
          },
          {
            title: 'Project picker',
            description:
              'Dedicated picker page with the Two Pebble logo for choosing or creating projects before entering the workspace.',
          },
          {
            title: 'Global examples and configuration',
            description:
              'Examples and configuration routes live outside project scope so they stay reachable from any context.',
          },
        ],
      },
      {
        title: 'Developer Environment',
        subtitle: 'Bridge Two Pebble with the editor and repositories where code lives.',
        features: [
          {
            title: 'IDE bridge',
            description:
              'Connect a local IDE so agents can open files, follow cursor context, and surface diagnostics inside Two Pebble.',
          },
          {
            title: 'GitHub PR integration',
            description:
              'Track agent-opened pull requests, surface open PRs on the overview page, and link straight out to GitHub.',
          },
          {
            title: 'Repository configuration',
            description:
              'Register repositories the workspace can operate on. Each repository carries its own integration credentials.',
          },
        ],
      },
    ],
  },
  {
    id: 'voice',
    title: 'Voice',
    subtitle: 'Talk to agents without losing the keyboard surface.',
    icon: 'mic',
    sections: [
      {
        title: 'Capture',
        subtitle: 'Use voice input while keeping normal text workflows visible.',
        features: [
          {
            title: 'Voice mode composer',
            description:
              'Keep the composer visible during voice mode with an inline waveform that reflects the current capture level.',
          },
          {
            title: 'Voice configuration',
            description: 'Pick a transcription provider and tune capture defaults from the voice configuration page.',
          },
        ],
      },
      {
        title: 'History',
        subtitle: 'Review and reuse captured speech.',
        features: [
          {
            title: 'Transcription history',
            description:
              'Browse past transcriptions, copy them inline with a toast confirmation, and see the timestamp for each capture.',
          },
        ],
      },
    ],
  },
  {
    id: 'operations',
    title: 'Operations',
    subtitle: 'Background work, developer signals, and analytics that keep the workspace healthy.',
    icon: 'activity',
    sections: [
      {
        title: 'Runtime Observability',
        subtitle: 'See what the workspace and agents are doing in real time.',
        features: [
          {
            title: 'Heartbeat events table',
            description:
              'Stream of agent and system events with a logs/events toggle and a fixed page width for easy scanning.',
          },
          {
            title: 'Signal developer view',
            description:
              'List layout of signal capabilities with icons so internal observability events stay easy to inspect.',
          },
        ],
      },
      {
        title: 'Automation And Metrics',
        subtitle: 'Schedule background work and inspect platform activity.',
        features: [
          {
            title: 'Automations',
            description:
              'Schedule and inspect background runs that fire agents on a cadence or in response to workspace events.',
          },
          {
            title: 'Metrics dashboards',
            description:
              'Charts for agent activity, model spend, and throughput. Includes line, bar, heatmap, sankey, and timeline visualizations.',
          },
          {
            title: 'Model call detail',
            description:
              'Drill into a single model call to see the raw request, response blocks, pricing breakdown, and overview metadata.',
          },
        ],
      },
    ],
  },
];

export function ExamplesPage() {
  const params = useParams();
  const pageId = params.pageId ?? EXAMPLE_DOC_PAGES[0]?.id ?? '';
  const page = EXAMPLE_DOC_PAGES.find((entry) => entry.id === pageId) ?? null;

  if (page === null) {
    return <Navigate replace to="/examples" />;
  }

  return (
    <PageLayout width="fixed">
      <Header subtitle={page.subtitle}>{page.title}</Header>
      {page.sections.map((section) => (
        <Section key={section.title} title={section.title} subtitle={section.subtitle}>
          <ListLayout
            bordered
            items={section.features.map((feature) => ({
              key: feature.title,
              title: feature.title,
              subtitle: feature.description,
            }))}
          />
        </Section>
      ))}
    </PageLayout>
  );
}
