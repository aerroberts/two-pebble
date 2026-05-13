export function image(base64Data: string) {
  return {
    type: 'image' as const,
    content: {
      base64Data,
    },
  };
}
