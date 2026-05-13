import type { RenderProps } from 'prism-react-renderer';

export type CodeLinesProps = RenderProps;

export function CodeLines(props: CodeLinesProps) {
  return (
    <pre className="text-sm font-mono leading-relaxed m-0 p-4 whitespace-pre-wrap !bg-transparent">
      <code>
        {props.tokens.map((line, lineIndex) => {
          const lineKey = line.map((token) => token.content).join('');
          return (
            <div key={lineKey} {...props.getLineProps({ line })}>
              {line.map((token) => {
                const tokenKey = `${lineIndex}-${token.types.join('.')}-${token.content}`;
                return <span key={tokenKey} {...props.getTokenProps({ token })} />;
              })}
            </div>
          );
        })}
      </code>
    </pre>
  );
}
