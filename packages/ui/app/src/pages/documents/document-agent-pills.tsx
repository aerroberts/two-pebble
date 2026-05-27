import { parseDocumentReferences } from '@two-pebble/datatypes';
import { useAgents } from '@two-pebble/realtime';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { projectPath, useProjectId } from '../../project-context';

interface DocumentAgentPillsProps {
  references: string;
}

/**
 * Renders one pill per distinct agent that has written to this document.
 * Reads `documents.references` (a JSON array of typed refs) and shows
 * `Written by {name}` chips linking to each agent. Returns nothing when
 * there are no agent references so hand-authored documents stay clean.
 */
export function DocumentAgentPills(props: DocumentAgentPillsProps) {
  const projectId = useProjectId();
  const agents = useAgents({ projectId });
  const refs = useMemo(() => parseDocumentReferences(props.references), [props.references]);
  const agentRefs = useMemo(() => refs.filter((ref) => ref.type === 'agent'), [refs]);

  if (agentRefs.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {agentRefs.map((ref) => {
        const agent = agents.getItem(ref.targetId)?.value;
        const label = agent?.name && agent.name.length > 0 ? agent.name : 'agent';
        return (
          <Link
            key={ref.targetId}
            to={projectPath(projectId, `/agents/${ref.targetId}`)}
            className="inline-flex items-center gap-1.5 rounded-full bg-surface-hover px-2 py-0.5 text-xs text-content transition-colors hover:text-accent"
          >
            <span className="text-content-muted">Written by</span>
            <span className="font-medium">{label}</span>
          </Link>
        );
      })}
    </div>
  );
}
