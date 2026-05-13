export function text(text: string) {
  return {
    type: 'text' as const,
    content: {
      text,
    },
  };
}
