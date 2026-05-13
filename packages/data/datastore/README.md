# @two-pebble/datastore

Datastore owns durable Two Pebble state. It wraps the Drizzle/libSQL SQLite
connection and exposes grouped async operations for integrations, agents, model
calls, traces, migrations, and status reads.

Use this package from daemon code or tests that need the same persistence layer
the app uses at runtime.

## Open And Migrate

```ts
import { Datastore } from '@two-pebble/datastore';
import { Logger, MemorySink } from '@two-pebble/logger';

const datastore = new Datastore({
  databaseFilePath: './.data/two-pebble.sqlite',
});

await datastore.migrate();
```

## Integrations

```ts
const integration = await datastore.integrations.create({
  data: { apiKey: 'sk-...' },
  name: 'OpenAI production',
  provider: 'openai',
});

await datastore.integrations.update({
  id: integration.id,
  data: { apiKey: 'sk-...' },
  name: 'OpenAI production',
});

const integrations = await datastore.integrations.list({ limit: 50 });
```

## Agents

```ts
const agent = await datastore.agent.create({
  description: 'A sample daemon agent.',
  name: 'Hello world',
});

await datastore.agent.traces.record({
  agentId: agent.id,
  orderId: 1,
  type: 'agent-start',
  data: { message: 'started' },
});

await datastore.close();
```
