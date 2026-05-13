import { Section } from '../../content/section/section';
import { DataValue } from '../../data/data-value/data-value';

/**
 * Data panel showing metadata about a selected trace.
 */
export function TraceDetailPanel() {
  return (
    <div className="px-4 py-4">
      <Section title="Metadata">
        <div className="divide-y divide-border">
          <DataValue title="Run" value="agent-run-0042" />
          <DataValue title="Model" value="gpt-5.4-mini" />
          <DataValue title="Duration" value="820 ms" />
          <DataValue title="Tool calls" value="3" />
          <DataValue title="Status" value="Complete" />
        </div>
      </Section>
      <Section title="Raw Event">
        <pre className="rounded-md bg-background p-3 text-[11px] font-mono text-content-muted overflow-auto">
          {`USER.MESSAGE\nTOOLS.REGISTERED\nMODEL.CALL\nAGENT.MESSAGE`}
        </pre>
      </Section>
      <Section title="Next Action">
        <p className="text-sm leading-6 text-content-muted">Open the model call transcript or replay this run.</p>
      </Section>
    </div>
  );
}
