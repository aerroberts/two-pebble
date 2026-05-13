import { Button, Section, Surface } from '@two-pebble/components';
import type { KnownCapability } from './known-capabilities';
import { knownCapabilities } from './known-capabilities';
import type { CapabilityConfigValue, CapabilitySpec } from './types';

export interface CapabilitiesSectionProps {
  attachedSpecs: CapabilitySpec[];
  onSetCapabilityConfig: (capabilityId: string, config: CapabilityConfigValue) => void;
  onRemoveCapability: (capabilityId: string) => void;
}

/**
 * Lists every capability the UI knows about. Each row shows the
 * capability's title + description, an attach/detach button, and the
 * capability's inline editor when attached. Mirrors the integrations
 * pattern: users pick from a fixed set of known capabilities rather
 * than authoring new ones.
 */
export function CapabilitiesSection(props: CapabilitiesSectionProps) {
  return (
    <Section title="Capabilities">
      {knownCapabilities.length === 0 ? <Surface>No capabilities are available in this build.</Surface> : null}
      {knownCapabilities.map((capability) => (
        <CapabilityRow
          key={capability.id}
          attachedSpec={props.attachedSpecs.find((spec) => spec.id === capability.id)}
          capability={capability}
          onRemoveCapability={props.onRemoveCapability}
          onSetCapabilityConfig={props.onSetCapabilityConfig}
        />
      ))}
    </Section>
  );
}

interface CapabilityRowProps {
  attachedSpec: CapabilitySpec | undefined;
  capability: KnownCapability<CapabilityConfigValue>;
  onRemoveCapability: (capabilityId: string) => void;
  onSetCapabilityConfig: (capabilityId: string, config: CapabilityConfigValue) => void;
}

function CapabilityRow(props: CapabilityRowProps) {
  const { capability, attachedSpec } = props;
  const attached = attachedSpec !== undefined;
  const config = attachedSpec?.config ?? capability.defaultConfig;
  const handleAttach = () => props.onSetCapabilityConfig(capability.id, capability.defaultConfig);
  const handleRemove = () => props.onRemoveCapability(capability.id);
  const handleChange = (next: CapabilityConfigValue) => props.onSetCapabilityConfig(capability.id, next);
  return (
    <Section
      actionItems={
        attached ? (
          <Button leftIcon="x" onClick={handleRemove} type="button" variant="secondary">
            Remove
          </Button>
        ) : (
          <Button leftIcon="plus" onClick={handleAttach} type="button" variant="primary">
            Add
          </Button>
        )
      }
      title={capability.title}
    >
      <Surface>{capability.description}</Surface>
      {attached && capability.Editor ? <capability.Editor config={config} onChange={handleChange} /> : null}
    </Section>
  );
}
