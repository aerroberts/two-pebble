export function codeBlock(language: string, code: string) {
  return {
    type: 'codeBlock' as const,
    content: {
      language,
      code,
    },
  };
}
