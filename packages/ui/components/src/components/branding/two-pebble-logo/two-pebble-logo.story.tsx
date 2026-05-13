import type { Meta, StoryObj } from '@storybook/react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { TwoPebbleLogo } from './two-pebble-logo';

const meta: Meta<typeof TwoPebbleLogo> = {
  title: 'Branding/TwoPebble Logo',
  component: TwoPebbleLogo,
};

export default meta;
type Story = StoryObj<typeof TwoPebbleLogo>;

export const Default: Story = {
  render: () => (
    <SyntaxExample>
      <TwoPebbleLogo />
    </SyntaxExample>
  ),
};

export const WithText: Story = {
  render: () => (
    <SyntaxExample>
      <TwoPebbleLogo withText />
    </SyntaxExample>
  ),
};

export const Large: Story = {
  render: () => (
    <SyntaxExample>
      <TwoPebbleLogo size="large" />
    </SyntaxExample>
  ),
};
