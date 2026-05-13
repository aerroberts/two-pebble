# @two-pebble/components

Components is the shared React component library for Two Pebble. It owns the
visual system, themes, layout primitives, inputs, data displays, charts, state
pages, provider logos, tooltips, and toasts.

Use this package from React apps and Storybook stories.

## Styles

```tsx
import '@two-pebble/components/styles.css';
```

## Layout

```tsx
import { FixedWidthPageLayout, Section, Sidebar, SidebarLayout } from '@two-pebble/components';

export function Page() {
  return (
    <SidebarLayout sidebar={<Sidebar brandingTitle="Two Pebble">Navigation</Sidebar>}>
      <FixedWidthPageLayout>
        <Section title="AI integrations">Content goes here.</Section>
      </FixedWidthPageLayout>
    </SidebarLayout>
  );
}
```

## Inputs

```tsx
import { Button, Input, Select } from '@two-pebble/components';

export function Form() {
  return (
    <>
      <Input label="Name" placeholder="OpenAI production" />
      <Select label="Provider" options={[{ label: 'OpenAI', value: 'openai' }]} />
      <Button leftIcon="save" variant="primary">Save</Button>
    </>
  );
}
```

## Storybook

```bash
bun run dev:components
```
