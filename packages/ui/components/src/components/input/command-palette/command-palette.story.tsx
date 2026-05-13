import type { Meta, StoryObj } from '@storybook/react';

import { useState } from 'react';
import { SyntaxExample } from '../../../storybook/syntax-example';
import { CommandPalette } from './command-palette';

const meta: Meta<typeof CommandPalette> = {
  title: 'Input/CommandPalette',
  component: CommandPalette,
};

export default meta;
type Story = StoryObj<typeof CommandPalette>;

const SAMPLE_ITEMS = [
  { id: '1', label: 'My Web App', description: 'https://mywebapp.com' },
  { id: '2', label: 'API Service', description: 'https://api.example.com' },
  { id: '3', label: 'Mobile Backend', description: 'https://mobile.example.com' },
  { id: '4', label: 'Admin Portal', description: 'Tenant abc123' },
];

function CommandPaletteDemo() {
  const [open, setOpen] = useState(true);

  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>
        Open Command Palette
      </button>
      <CommandPalette
        open={open}
        onClose={() => setOpen(false)}
        onSelect={() => setOpen(false)}
        items={SAMPLE_ITEMS}
        placeholder="Search applications..."
      />
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <SyntaxExample>
      <CommandPaletteDemo />
    </SyntaxExample>
  ),
};
