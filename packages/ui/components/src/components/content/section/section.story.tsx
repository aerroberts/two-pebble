import type { Meta, StoryObj } from '@storybook/react';
import { SyntaxExample } from '../../../storybook/syntax-example';
import { Section } from './section';

const meta: Meta<typeof Section> = {
  title: 'Content/Section',
  component: Section,
};

export default meta;
type Story = StoryObj<typeof Section>;

export const WithTitle: Story = {
  render: () => (
    <SyntaxExample>
      <Section title="Overview">
        <p>Section body content.</p>
      </Section>
    </SyntaxExample>
  ),
};

export const WithoutTitle: Story = {
  render: () => (
    <SyntaxExample>
      <Section>
        <p>Grouped content.</p>
      </Section>
    </SyntaxExample>
  ),
};
