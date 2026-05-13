import { text } from '../../../thread/cells/index';
import { ConversationThread } from '../../../thread/index';
import { OllamaProvider } from './ollama-provider';

interface ProviderFetchRequest {
  body: object;
  headers: Record<string, string>;
  method: string | undefined;
  url: string;
}

export function ollamaProviderTestEnv() {
  const originalFetch = global.fetch;
  const requests: ProviderFetchRequest[] = [];

  return {
    requests,
    provider() {
      return new OllamaProvider({
        baseUrl: 'https://ollama.test',
        model: 'llama-test',
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

        return new Response(JSON.stringify({ message: { content: 'done' } }));
      }) as typeof fetch;
    },
    thread() {
      const thread = new ConversationThread({ cells: [], threadId: 'thread-test' });
      thread.pushUser('User Message', text('hello'));
      return thread;
    },
  };
}
