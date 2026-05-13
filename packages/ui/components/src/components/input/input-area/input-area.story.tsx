import type { Meta, StoryObj } from '@storybook/react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { InputArea } from './input-area';

const meta: Meta<typeof InputArea> = {
  title: 'Input/Input Area',
  component: InputArea,
};

export default meta;
type Story = StoryObj<typeof InputArea>;

export const Default: Story = {
  render: () => (
    <>
      <SyntaxExample>
        <InputArea placeholder="Enter a description..." />
      </SyntaxExample>
      <SyntaxExample>
        <InputArea label="Notes" placeholder="Add any additional notes..." rows={4} />
      </SyntaxExample>
    </>
  ),
};
