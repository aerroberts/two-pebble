import type { Meta, StoryObj } from '@storybook/react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { Select } from './select';

const meta: Meta<typeof Select> = {
  title: 'Input/Select',
  component: Select,
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: () => (
    <>
      <SyntaxExample>
        <Select
          label="Region"
          placeholder="Choose region"
          options={[
            { value: 'us-east-1', label: 'US East (N. Virginia)' },
            { value: 'eu-west-1', label: 'EU (Ireland)' },
          ]}
        />
      </SyntaxExample>
      <SyntaxExample>
        <Select
          searchable
          label="Searchable region"
          placeholder="Search regions"
          options={[
            { value: 'us-east-1', label: 'US East (N. Virginia)' },
            { value: 'us-west-2', label: 'US West (Oregon)' },
            { value: 'eu-west-1', label: 'EU (Ireland)' },
            { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
          ]}
        />
      </SyntaxExample>
    </>
  ),
};
