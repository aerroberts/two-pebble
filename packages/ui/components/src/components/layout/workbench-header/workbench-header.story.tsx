import type { Meta, StoryObj } from '@storybook/react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { Button } from '../../input/button/button';
import { TabSelect } from '../../input/tab-select/tab-select';
import { WorkbenchHeader } from './workbench-header';

const meta: Meta<typeof WorkbenchHeader> = {
  title: 'Layout/WorkbenchHeader',
  component: WorkbenchHeader,
};

export default meta;
type Story = StoryObj<typeof WorkbenchHeader>;

const TABS = [
  { value: 'graph', label: 'Graph', icon: 'workflow' },
  { value: 'list', label: 'List', icon: 'list' },
];

export const Default: Story = {
  render: () => (
    <SyntaxExample>
      <div className="w-[640px]">
        <WorkbenchHeader
          leftAccessory={
            <Button variant="secondary" leftIcon="arrow-left">
              Back
            </Button>
          }
          title={
            <span className="font-heading text-[18px] uppercase tracking-[0.18em] text-content">Migration epic</span>
          }
          rightAccessory={<TabSelect options={TABS} value="graph" />}
        />
      </div>
    </SyntaxExample>
  ),
};
