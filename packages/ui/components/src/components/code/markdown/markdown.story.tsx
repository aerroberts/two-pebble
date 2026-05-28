import type { Meta, StoryObj } from '@storybook/react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { MarkdownView } from './markdown';

const meta: Meta<typeof MarkdownView> = {
  title: 'Code/Markdown',
  component: MarkdownView,
};

export default meta;
type Story = StoryObj<typeof MarkdownView>;

export const RichContent: Story = {
  render: () => (
    <SyntaxExample>
      <MarkdownView
        content={
          '# Hello\n\nI will write a **test file** and run the tests.\n\n- Step 1: Write file\n- Step 2: Run tests\n\n```typescript\nconsole.log("done");\n```'
        }
      />
    </SyntaxExample>
  ),
};

export const WithMermaid: Story = {
  render: () => (
    <SyntaxExample>
      <MarkdownView
        content={
          '# Pipeline\n\nHere is the flow:\n\n```mermaid\nflowchart LR\n  A[Input] --> B{Valid?}\n  B -- Yes --> C[Process]\n  B -- No --> D[Reject]\n```\n\nThat is the full picture.'
        }
      />
    </SyntaxExample>
  ),
};
