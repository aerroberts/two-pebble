import { text } from '../../../thread/cells/index';
import { ConversationThread } from '../../../thread/index';
import { OpenAIProvider } from './open-aiprovider';

interface ProviderFetchRequest {
  body: object;
  headers: Record<string, string>;
  method: string | undefined;
  url: string;
}

export function openaiProviderTestEnv() {
  const originalFetch = global.fetch;
  const requests: ProviderFetchRequest[] = [];

  return {
    requests,
    provider() {
      return new OpenAIProvider({
        apiKey: 'openai-key',
        baseUrl: 'https://openai.test/v1',
        model: 'gpt-5.2',
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

        return new Response(JSON.stringify(openaiSuccessResponseBody()));
      }) as typeof fetch;
    },
    thread() {
      const thread = new ConversationThread({ cells: [], threadId: 'thread-test' });
      thread.pushUser('User Message', text('hello'));
      return thread;
    },
  };
}

function openaiSuccessResponseBody() {
  return {
    choices: [{ message: { content: 'done' } }],
    usage: {
      completion_tokens: 4,
      completion_tokens_details: { reasoning_tokens: 1 },
      prompt_tokens: 10,
      prompt_tokens_details: { cached_tokens: 2 },
    },
  };
}
