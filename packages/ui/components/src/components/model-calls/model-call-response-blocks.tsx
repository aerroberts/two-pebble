import { CodeBlock } from '../code/code-block/code-block';
import { stringifyJsonForDisplay } from '../code/json/json-utils';

export type ModelCallResponseBlock =
  | {
      text: string;
      type: 'thinking';
    }
  | {
      text: string;
      type: 'text';
    }
  | {
      base64Image: string;
      type: 'image';
    }
  | {
      callid: string;
      payload: object;
      toolid: string;
      type: 'tool';
    };

export interface ModelCallResponseBlocksProps {
  blocks: ModelCallResponseBlock[];
}

export function ModelCallResponseBlocks(props: ModelCallResponseBlocksProps) {
  return (
    <div className="flex flex-col gap-2">
      {props.blocks.map((block) => (
        <ModelCallResponseCell key={getModelCallResponseBlockKey(block)} block={block} />
      ))}
    </div>
  );
}

function ModelCallResponseCell(props: { block: ModelCallResponseBlock }) {
  return <div className="px-3 py-2">{renderModelCallResponseBlock(props.block)}</div>;
}

function renderModelCallResponseBlock(block: ModelCallResponseBlock) {
  switch (block.type) {
    case 'image':
      return (
        <img
          alt="Model response"
          className="max-h-[360px] rounded border border-border object-contain"
          src={`data:image/*;base64,${block.base64Image}`}
        />
      );
    case 'thinking':
      return <ModelCallResponseTextBlock text={block.text} />;
    case 'text':
      return <ModelCallResponseTextBlock text={block.text} />;
    case 'tool':
      return (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            <span className="uppercase tracking-[0.08em] text-content-muted">Tool</span>
            <span className="font-mono text-content">{block.toolid}</span>
            {block.callid.length > 0 ? (
              <>
                <span className="uppercase tracking-[0.08em] text-content-muted">Call ID</span>
                <span className="font-mono text-content-muted">{block.callid}</span>
              </>
            ) : null}
          </div>
          <CodeBlock content={stringifyJsonForDisplay(block.payload)} language="json" />
        </div>
      );
  }
}

function ModelCallResponseTextBlock(props: { text: string }) {
  return <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-5 text-content">{props.text}</pre>;
}

function getModelCallResponseBlockKey(block: ModelCallResponseBlock) {
  return JSON.stringify(block);
}
