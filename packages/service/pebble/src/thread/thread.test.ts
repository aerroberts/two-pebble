import { describe, expect, it } from 'bun:test';
import { Cell, ConversationThread, type ConversationThreadCell, Event } from './index';

describe('feature: conversation thread', () => {
  const existingCells: ConversationThreadCell[] = [
    { orderId: 1, cells: [Cell.data({ provider: 'anthropic' })], label: 'Provider Cache', role: 'system' },
  ];

  it('happy: appends role-owned cells from direct cells and events', () => {
    const thread = new ConversationThread({ cells: [], threadId: 'thread-test' });
    thread.pushSystem('System Prompt', Cell.text('You are concise.'));
    thread.pushUser('User Message', ...Event.userMessage({ content: 'Build the API.' }));
    thread.pushAssistant('Assistant Message', Cell.codeBlock('json', '{"ok":true}'));

    expect(thread.cells).toEqual([
      { orderId: 1, cells: [Cell.text('You are concise.')], label: 'System Prompt', role: 'system' },
      { orderId: 2, cells: Event.userMessage({ content: 'Build the API.' }), label: 'User Message', role: 'user' },
      { orderId: 3, cells: [Cell.codeBlock('json', '{"ok":true}')], label: 'Assistant Message', role: 'assistant' },
    ]);
  });

  it('happy: incoming message event preserves structured user cells', () => {
    expect(Event.incomingMessage({ content: [Cell.text('hello'), Cell.image('AAAA')] })).toEqual([
      Cell.header2('User message'),
      Cell.text('The user provided the following message:'),
      Cell.text('hello'),
      Cell.image('AAAA'),
    ]);
  });

  it('happy: serializes adjacent cells into provider turns without mutating the thread', () => {
    const thread = new ConversationThread({ cells: [], threadId: 'thread-test' });
    thread.pushUser('User Message', Cell.text('first'));
    thread.pushUser('User Message', Cell.text('second'));
    thread.pushAssistant('Assistant Message', ...Event.agentMessage({ raw: 'third' }));

    expect(thread.serialize()).toEqual([
      { role: 'user', raw: 'firstsecond', cells: [Cell.text('first'), Cell.text('second')] },
      { role: 'assistant', raw: 'third', cells: [Cell.text('third')] },
    ]);
  });

  it('happy: can be constructed from existing cells', () => {
    const thread = new ConversationThread({ cells: existingCells, threadId: 'thread-test' });

    expect(thread.cells).toEqual(existingCells);
  });

  it('happy: notifies listeners when new cells are appended', () => {
    const thread = new ConversationThread({ cells: existingCells, threadId: 'thread-test' });
    const observed: ConversationThreadCell[] = [];
    const unsubscribe = thread.onCell((cell) => observed.push(cell));

    thread.pushUser('User Message', Cell.text('first'));
    unsubscribe();
    thread.pushUser('User Message', Cell.text('second'));

    expect(observed).toEqual([{ orderId: 2, cells: [Cell.text('first')], label: 'User Message', role: 'user' }]);
  });

  it('happy: serializes audio cells with transcript placeholder for text-only providers', () => {
    const thread = new ConversationThread({ cells: [], threadId: 'thread-test' });
    thread.pushUser('Voice', Cell.audio({ base64Data: 'AAAA', mimeType: 'audio/wav', transcript: 'hello' }));

    expect(thread.serialize()).toEqual([
      {
        role: 'user',
        raw: '[audio: hello]',
        cells: [Cell.audio({ base64Data: 'AAAA', mimeType: 'audio/wav', transcript: 'hello' })],
      },
    ]);
  });
});
