import type { Meta, StoryObj } from '@storybook/react';

import { SyntaxExample } from '../../../storybook/syntax-example';
import { MermaidDiagram } from './mermaid-diagram';

const meta: Meta<typeof MermaidDiagram> = {
  title: 'Code/MermaidDiagram',
  component: MermaidDiagram,
};

export default meta;
type Story = StoryObj<typeof MermaidDiagram>;

const FLOWCHART_SOURCE = `flowchart LR
  A[Start] --> B{Choice?}
  B -- Yes --> C[Do thing]
  B -- No --> D[Skip]
  C --> E[Done]
  D --> E[Done]`;

const SEQUENCE_SOURCE = `sequenceDiagram
  participant U as User
  participant S as Service
  U->>S: Request
  S-->>U: Response`;

export const Flowchart: Story = {
  render: () => (
    <SyntaxExample>
      <MermaidDiagram code={FLOWCHART_SOURCE} />
    </SyntaxExample>
  ),
};

export const Sequence: Story = {
  render: () => (
    <SyntaxExample>
      <MermaidDiagram code={SEQUENCE_SOURCE} />
    </SyntaxExample>
  ),
};
