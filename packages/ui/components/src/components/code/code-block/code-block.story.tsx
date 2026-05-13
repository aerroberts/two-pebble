import type { Meta, StoryObj } from '@storybook/react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { CodeBlock } from './code-block';

const meta: Meta<typeof CodeBlock> = {
  title: 'Code/Code Block',
  component: CodeBlock,
};

export default meta;
type Story = StoryObj<typeof CodeBlock>;

export const TypeScript: Story = {
  render: () => (
    <SyntaxExample>
      <CodeBlock
        lineNumbers
        title="index.ts"
        content={
          "import { Agent } from '@two-pebble/intelligence';\n\nconst agent = new Agent({ name: 'test' });\nawait agent.run();"
        }
      />
    </SyntaxExample>
  ),
};

export const BashOutput: Story = {
  render: () => (
    <SyntaxExample>
      <CodeBlock
        content="bun test packages/runtime"
        language="bash"
        output="exit code: 0\nAll tests passed."
        outputLanguage="text"
      />
    </SyntaxExample>
  ),
};
