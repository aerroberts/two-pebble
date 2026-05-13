import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { EditableHeading } from './editable-heading';

const meta: Meta<typeof EditableHeading> = {
  title: 'Content/EditableHeading',
  component: EditableHeading,
};

export default meta;
type Story = StoryObj<typeof EditableHeading>;

export const Default: Story = {
  render: () => <Demo initial="Migration epic" />,
};

export const Empty: Story = {
  render: () => <Demo initial="" />,
};

interface DemoProps {
  initial: string;
}

function Demo(props: DemoProps) {
  const [value, setValue] = useState(props.initial);
  return (
    <SyntaxExample>
      <div className="w-[420px]">
        <EditableHeading value={value} onChange={setValue} placeholder="Untitled board" ariaLabel="Heading" />
      </div>
    </SyntaxExample>
  );
}
