export function header2(text: string) {
  return {
    type: 'header2' as const,
    content: {
      text,
    },
  };
}
