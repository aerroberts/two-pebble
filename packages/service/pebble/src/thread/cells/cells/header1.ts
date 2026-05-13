export function header1(text: string) {
  return {
    type: 'header1' as const,
    content: {
      text,
    },
  };
}
