import type { Meta, StoryObj } from '@storybook/react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { Breadcrumb } from './breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Navigation/Breadcrumb',
  component: Breadcrumb,
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {
  render: () => (
    <SyntaxExample>
      <Breadcrumb
        items={[{ label: 'Home', href: '/' }, { label: 'Projects', href: '/projects' }, { label: 'Acme Corp' }]}
      />
    </SyntaxExample>
  ),
};
