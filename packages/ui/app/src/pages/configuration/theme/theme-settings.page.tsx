import { Header, PageLayout, Section, ThemeToggle } from '@two-pebble/components';

export function ThemeSettingsPage() {
  return (
    <PageLayout width="fixed">
      <Header>Theme</Header>
      <Section title="Theme">
        <ThemeToggle />
      </Section>
    </PageLayout>
  );
}
