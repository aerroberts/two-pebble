import { text } from '../../../thread/cells/index';
import { ConversationThread } from '../../../thread/index';
import { OpenRouterProvider } from './open-router-provider';

interface ProviderFetchRequest {
  body: object;
  headers: Record<string, string>;
  method: string | undefined;
  url: string;
}

export function openRouterProviderTestEnv() {
  const originalFetch = global.fetch;
  const requests: ProviderFetchRequest[] = [];

  return {
    requests,
    provider() {
      return new OpenRouterProvider({
        apiKey: 'openrouter-key',
        appName: 'Two Pebble',
        baseUrl: 'https://openrouter.test/api/v1',
        model: 'openrouter-test',
        siteUrl: 'https://two-pebble.test',
      });
    },
    restoreFetch() {
      global.fetch = originalFetch;
    },
    useSuccessfulFetch() {
      global.fetch = (async (url, init) => {
        requests.push({
          body: JSON.parse(String(init?.body)) as object,
          headers: Object.fromEntries(new Headers(init?.headers).entries()),
          method: init?.method,
          url: String(url),
        });

        return new Response(JSON.stringify({ choices: [{ message: { content: 'done' } }] }));
      }) as typeof fetch;
    },
    thread() {
      const thread = new ConversationThread({ cells: [], threadId: 'thread-test' });
      thread.pushUser('User Message', text('hello'));
      return thread;
    },
  };
}
