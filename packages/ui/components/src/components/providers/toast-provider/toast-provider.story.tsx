import type { Meta, StoryObj } from '@storybook/react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { Button } from '../../input/button/button';
import { ToastProvider } from './toast-provider';
import { useToast } from './use-toast';

function ToastDemo() {
  const { toast } = useToast();

  return (
    <div>
      <Button onClick={() => toast('Something happened', 'info')}>Info Toast</Button>
      <Button onClick={() => toast('Action succeeded', 'success')}>Success Toast</Button>
      <Button onClick={() => toast('Something went wrong', 'error')}>Error Toast</Button>
    </div>
  );
}

const meta: Meta<typeof ToastProvider> = {
  title: 'Providers/Toast Provider',
  component: ToastProvider,
};

export default meta;
type Story = StoryObj<typeof ToastProvider>;

export const Default: Story = {
  render: () => (
    <SyntaxExample>
      <ToastProvider>
        <ToastDemo />
      </ToastProvider>
    </SyntaxExample>
  ),
};
