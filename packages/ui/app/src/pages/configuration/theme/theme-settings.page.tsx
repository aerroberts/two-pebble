import { Header, PageLayout, Section, ThemeToggle } from '@two-pebble/components';

export function ThemeSettingsPage() {
  return (
    <PageLayout width="fixed">
      <Header subtitle="Choose the colour theme used across every page in this browser.">Theme</Header>
      <Section title="Theme">
        <ThemeToggle />
      </Section>
    </PageLayout>
  );
}
