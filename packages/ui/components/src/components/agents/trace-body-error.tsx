'use client';

export interface TraceBodyErrorProps {
  message: string;
}

// Renders an error message inside an AgentTrace body with the danger foreground color so
// failures are immediately visually distinct from plaintext/json output.
export function TraceBodyError(props: TraceBodyErrorProps) {
  return <pre className="whitespace-pre-wrap break-words text-xs text-danger font-mono">{props.message}</pre>;
}
