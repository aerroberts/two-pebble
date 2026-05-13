# @two-pebble/matrix

Matrix owns the model-facing runtime primitives for Two Pebble. It provides
conversation threads, serializable cells and events, provider adapters, Zod data
serialization, custom tool parsing, agent lifecycle hooks, and trace types.

Use this package when code needs to build model context, call a provider, or run
a Matrix agent loop.

## Threads

```ts
import { Cell, ConversationThread, Event } from '@two-pebble/matrix';

const thread = new ConversationThread();

thread.pushSystem(Event.systemPrompt({ content: 'You are concise.' }));
thread.pushUser(Event.userMessage({ content: 'Say hello.' }));
thread.pushAssistant(Cell.text('Hello.'));

const turns = thread.serialize();
console.log(turns[0].raw);
```

## Zod Serialization

```ts
import { DataSerializer } from '@two-pebble/matrix';
import { z } from 'zod';

const serializer = new DataSerializer();
const schema = z.object({
  name: z.string().describe('The integration name.'),
  provider: z.enum(['openai', 'anthropic', 'openrouter']),
});

console.log(serializer.toJson(schema));
console.log(serializer.toXml(schema, { rootTag: 'createIntegration' }));
console.log(serializer.toToon(schema));
```

## Agent

```ts
import { MatrixAgent, OpenAIProvider } from '@two-pebble/matrix';

const agent = new MatrixAgent({
  description: 'Answers one user request.',
  instructions: ['Say hello.'],
  maxSteps: 1,
  name: 'Hello',
  provider: new OpenAIProvider({ apiKey: process.env.OPENAI_API_KEY ?? '', model: 'gpt-5.4-mini' }),
  systemPrompt: 'You are brief.',
});

agent.onTrace((trace) => console.log(trace.type));
const result = await agent.run();
console.log(result.status);
```
