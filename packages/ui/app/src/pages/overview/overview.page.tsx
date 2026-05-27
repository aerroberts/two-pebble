import { Header, ListLayout, PageLayout, Section, Surface } from '@two-pebble/components';
import { useAgents, useMyOpenPrs } from '@two-pebble/realtime';

export function OverviewPage() {
  const prs = useMyOpenPrs();
  const agents = useAgents();

  return (
    <PageLayout width="fixed">
      <Header>Welcome to Two Pebble</Header>
      <Section title="My Open PRs">
        {prs.length === 0 ? (
          <Surface>No tracked PRs are waiting on GitHub.</Surface>
        ) : (
          <ListLayout
            items={prs.map((pr) => {
              const agent = agents.getItem(pr.agentId)?.value ?? null;
              return {
                key: pr.id,
                title: `${pr.repo}#${pr.number}`,
                subtitle: agent === null ? pr.agentId : agent.name,
                value: pr.state,
                trailingAccessory: (
                  <a className="text-[12px] text-accent hover:underline" href={pr.url} rel="noreferrer" target="_blank">
                    Open
                  </a>
                ),
              };
            })}
          />
        )}
      </Section>
    </PageLayout>
  );
}
