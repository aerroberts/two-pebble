import { CodeBlock, Section, Surface } from '@two-pebble/components';
import type { ModelCallData } from './model-call-data';

interface ModelCallRawViewProps {
  data: ModelCallData | null;
}

export function ModelCallRawView(props: ModelCallRawViewProps) {
  if (props.data === null) {
    return (
      <Section>
        <Surface>Loading model call data.</Surface>
      </Section>
    );
  }

  return (
    <>
      <Section title="Provider Request">
        <CodeBlock content={JSON.stringify(props.data.providerInput, null, 2)} language="json" />
      </Section>
      <Section title="Provider Response">
        <CodeBlock content={JSON.stringify(props.data.providerOutput, null, 2)} language="json" />
      </Section>
    </>
  );
}
