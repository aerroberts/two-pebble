export function installProviderFetchForTesting() {
  const originalFetch = global.fetch;
  const providerFetch = Object.assign(
    async () => new Response(JSON.stringify({ choices: [{ message: { content: 'hello from provider fetch test' } }] })),
    { preconnect: originalFetch.preconnect },
  );
  global.fetch = providerFetch;
  return () => {
    global.fetch = originalFetch;
  };
}
