import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { AutocompleteInput } from './autocomplete-input';

const meta: Meta<typeof AutocompleteInput> = {
  title: 'Input/AutocompleteInput',
  component: AutocompleteInput,
};

export default meta;
type Story = StoryObj<typeof AutocompleteInput>;

const SECTIONS = [
  { label: 'Engineering', value: 'Engineering' },
  { label: 'Design', value: 'Design' },
  { label: 'Product', value: 'Product' },
  { label: 'Operations', value: 'Operations' },
  { label: 'Research', value: 'Research' },
];

function AutocompleteExample(props: {
  placeholder?: string;
  leadingIcon?: string;
  variant?: 'default' | 'borderless';
}) {
  const [value, setValue] = useState('');
  return (
    <AutocompleteInput
      placeholder={props.placeholder}
      leadingIcon={props.leadingIcon}
      variant={props.variant}
      value={value}
      onChange={setValue}
      suggestions={SECTIONS}
    />
  );
}

export const Default: Story = {
  render: () => (
    <>
      <SyntaxExample>
        <AutocompleteExample placeholder="Section" />
      </SyntaxExample>
      <SyntaxExample>
        <AutocompleteExample placeholder="Section" leadingIcon="folder" />
      </SyntaxExample>
      <SyntaxExample>
        <AutocompleteExample placeholder="Section" leadingIcon="folder" variant="borderless" />
      </SyntaxExample>
    </>
  ),
};
