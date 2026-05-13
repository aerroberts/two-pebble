import { text } from '../../../thread/cells/index';
import { ConversationThread } from '../../../thread/index';
import { AnthropicProvider } from './anthropic-provider';

interface ProviderFetchRequest {
  body: object;
  headers: Record<string, string>;
  method: string | undefined;
  url: string;
}

export function anthropicProviderTestEnv() {
  const originalFetch = global.fetch;
  const requests: ProviderFetchRequest[] = [];

  return {
    requests,
    provider() {
      return new AnthropicProvider({
        apiKey: 'anthropic-key',
        baseUrl: 'https://anthropic.test/v1',
        maxTokens: 1000,
        model: 'claude-sonnet-4',
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

        return new Response(JSON.stringify(anthropicSuccessResponseBody()));
      }) as typeof fetch;
    },
    thread() {
      const thread = new ConversationThread({ cells: [], threadId: 'thread-test' });
      thread.pushUser('User Message', text('hello'));
      return thread;
    },
  };
}

function anthropicSuccessResponseBody() {
  return {
    content: [{ type: 'text', text: 'done' }],
    usage: {
      cache_creation_input_tokens: 3,
      cache_read_input_tokens: 2,
      input_tokens: 10,
      output_tokens: 4,
    },
  };
}
