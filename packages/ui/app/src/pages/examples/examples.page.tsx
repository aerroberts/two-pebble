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

interface ExampleGuide {
  title: string;
  subtitle: string;
  steps: ExampleEntry[];
}

export interface ExampleDocPage {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  guide: ExampleGuide;
  sections: ExampleSection[];
}

export const EXAMPLE_DOC_PAGES: ExampleDocPage[] = [
  {
    id: 'agents',
    title: 'Agents',
    subtitle: 'Run, observe, and steer coding agents from a single chat surface.',
    icon: 'bot',
    guide: {
      title: 'Run an agent from chat',
      subtitle: 'Use this flow when you want Two Pebble to turn a request into tracked work.',
      steps: [
        {
          title: 'Start with the right context',
          description:
            'Open the project that owns the repository, documents, and task boards you want the agent to use. Project scope keeps references and navigation pointed at the right workspace.',
        },
        {
          title: 'Choose a runner before sending',
          description:
            'Use the agent selector in the composer or Cmd+K menu to choose Assistant, Codex, Claude Code, or another configured registry before the first prompt.',
        },
        {
          title: 'Attach durable references',
          description:
            'Mention documents, boards, and tasks directly in the prompt so the agent sees stable IDs instead of vague natural-language context.',
        },
        {
          title: 'Inspect the run as it works',
          description:
            'Use the trace, waterfall, and price tabs to review tool calls, model calls, queued follow-ups, and cost while the agent is still running.',
        },
      ],
    },
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
    guide: {
      title: 'Build an agent-ready document',
      subtitle: 'Use documents when work needs durable structure that agents can read and update over time.',
      steps: [
        {
          title: 'Create or import the source material',
          description:
            'Draft directly in the editor or paste Markdown with headings, lists, code blocks, and tables. The editor keeps the document structured for later agent edits.',
        },
        {
          title: 'Organize before sharing',
          description:
            'Assign the document to a section from the header dropdown so it appears in the right sidebar group and remains easy to find.',
        },
        {
          title: 'Reference the document from chat or tasks',
          description:
            'Use document mentions in prompts and task descriptions instead of copying long content into chat. Agents receive the referenced content with stable boundaries.',
        },
        {
          title: 'Send the document to a runner',
          description:
            'Use the document header action when the document itself is the work item. The configured runner receives the document context and can write updates back.',
        },
      ],
    },
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
    guide: {
      title: 'Drive work from a board',
      subtitle: 'Use task boards when multiple changes need clear ownership, requirements, and independent PRs.',
      steps: [
        {
          title: 'Create the board shape first',
          description:
            'Set up pools, dependencies, and a default task template before adding many tasks. The structure tells agents which work is unblocked.',
        },
        {
          title: 'Write tasks as executable requests',
          description:
            'Give each task a specific outcome, project context, and any relevant document or board references. Add deliverables when the result must include a PR, text answer, or artifact.',
        },
        {
          title: 'Delegate only actionable tasks',
          description:
            'Assign agents to tasks that are not blocked by dependencies. The task drawer and status events show whether an agent is working, waiting, or complete.',
        },
        {
          title: 'Close the loop with deliverables',
          description:
            'Review submitted PRs or text deliverables from the task drawer, then mark the task success, failure, waiting, or canceled with a reason.',
        },
      ],
    },
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
    guide: {
      title: 'Set up a working project',
      subtitle: 'Use workspace settings to connect the data, repository, and local editor an agent needs.',
      steps: [
        {
          title: 'Create or choose a project',
          description:
            'Use the projects page as the entry point for new work. A project scopes agents, documents, task boards, and workspace navigation.',
        },
        {
          title: 'Register the repository',
          description:
            'Add the repository path and integration details under settings so agents can create worktrees and link PRs back to the right source.',
        },
        {
          title: 'Connect the local IDE',
          description:
            'Detect or add your preferred editor, then set the default IDE from the IDE settings page so open-in-editor buttons use the right target.',
        },
        {
          title: 'Use scoped navigation',
          description:
            'Switch projects from the sidebar selector and stay inside project-scoped routes while working on agents, documents, tasks, and automations.',
        },
      ],
    },
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
    guide: {
      title: 'Send a voice-assisted prompt',
      subtitle: 'Use voice input for longer prompts while keeping the normal composer available for edits.',
      steps: [
        {
          title: 'Configure transcription first',
          description:
            'Pick the transcription provider and profile in voice settings. The composer uses those settings when it captures speech.',
        },
        {
          title: 'Capture without leaving the composer',
          description:
            'Start voice mode from the composer. The text input remains visible while the waveform shows capture activity near the mic control.',
        },
        {
          title: 'Review before sending',
          description:
            'Treat the transcript as a draft. Edit names, paths, and references before submitting so the agent receives precise instructions.',
        },
        {
          title: 'Reuse past transcripts',
          description:
            'Open transcription history when you need to recover a previous capture, copy a prompt, or check when a voice note was recorded.',
        },
      ],
    },
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
    guide: {
      title: 'Operate and debug the system',
      subtitle: 'Use these views when you need to understand what Two Pebble is doing behind the scenes.',
      steps: [
        {
          title: 'Start with runtime signals',
          description:
            'Use developer signal and heartbeat pages to see whether agents, automations, and background services are running or waiting.',
        },
        {
          title: 'Inspect individual model calls',
          description:
            'Open a model call when you need raw request and response details, pricing line items, or a precise failure point.',
        },
        {
          title: 'Schedule repeatable work',
          description:
            'Use automations for recurring agent runs. Each automation records runs so you can audit what happened and when.',
        },
        {
          title: 'Watch cost and throughput',
          description:
            'Use metrics and pricing pages to compare usage over time, spot expensive runs, and verify model activity by provider or agent.',
        },
      ],
    },
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
      <Section title={page.guide.title} subtitle={page.guide.subtitle}>
        <ListLayout
          bordered
          items={page.guide.steps.map((step, index) => ({
            key: step.title,
            title: `${index + 1}. ${step.title}`,
            subtitle: step.description,
          }))}
        />
      </Section>
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
