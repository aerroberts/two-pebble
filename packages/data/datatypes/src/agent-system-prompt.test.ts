import { describe, expect, test } from 'bun:test';
import {
  agentSystemPromptFromText,
  emptyAgentSystemPrompt,
  parseAgentSystemPrompt,
  renderAgentSystemPromptToText,
  serializeAgentSystemPrompt,
} from './agent-system-prompt';

describe('feature: agent system prompt parsing', () => {
  test('happy: parses canonical TipTap JSON', () => {
    const doc = { type: 'doc' as const, content: [{ type: 'paragraph' }] };
    const round = parseAgentSystemPrompt(JSON.stringify(doc));
    expect(round).toEqual(doc);
  });

  test('happy: wraps legacy plain text into paragraphs split on blank lines', () => {
    const doc = parseAgentSystemPrompt('You are a helpful assistant.\n\nBe concise.');
    expect(doc).toEqual({
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'You are a helpful assistant.' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Be concise.' }] },
      ],
    });
  });

  test('happy: blank input returns an empty doc', () => {
    expect(parseAgentSystemPrompt('')).toEqual(emptyAgentSystemPrompt());
  });

  test('happy: invalid JSON falls back to plain text wrap', () => {
    const doc = parseAgentSystemPrompt('{ this is { not valid json } { @something');
    expect(doc.type).toBe('doc');
    expect(doc.content?.[0]).toEqual({
      type: 'paragraph',
      content: [{ type: 'text', text: '{ this is { not valid json } { @something' }],
    });
  });
});

describe('feature: agent system prompt serialization', () => {
  test('happy: round-trips a doc through serialize/parse', () => {
    const doc = agentSystemPromptFromText('Hello');
    expect(parseAgentSystemPrompt(serializeAgentSystemPrompt(doc))).toEqual(doc);
  });
});

describe('feature: agent system prompt rendering to text', () => {
  test('happy: paragraphs join with a blank line and trim trailing whitespace', () => {
    const doc = agentSystemPromptFromText('Hello\n\nWorld');
    expect(renderAgentSystemPromptToText(doc)).toBe('Hello\n\nWorld');
  });

  test('happy: documentMention nodes render as @name', () => {
    const doc = {
      type: 'doc' as const,
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'See ' },
            { type: 'documentMention', attrs: { documentId: 'doc-1', name: 'Plan' } },
            { type: 'text', text: ' for context.' },
          ],
        },
      ],
    };
    expect(renderAgentSystemPromptToText(doc)).toBe('See @Plan for context.');
  });
});
