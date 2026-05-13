import { ModelCallResponseBlocks, Section, Surface } from '@two-pebble/components';
import type { ModelCallData } from './model-call-data';

interface ModelCallResponseViewProps {
  data: ModelCallData | null;
}

export function ModelCallResponseView(props: ModelCallResponseViewProps) {
  if (props.data === null) {
    return (
      <Section>
        <Surface>Loading model call response.</Surface>
      </Section>
    );
  }

  if (props.data.output.length === 0) {
    return (
      <Section title="Response">
        <Surface>No parsed response blocks.</Surface>
      </Section>
    );
  }

  return (
    <Section title="Response">
      <ModelCallResponseBlocks blocks={props.data.output} />
    </Section>
  );
}
