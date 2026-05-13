export interface AudioCellInput {
  base64Data: string;
  mimeType: string;
  transcript?: string;
  durationMs?: number;
}

export function audio(input: AudioCellInput) {
  return {
    type: 'audio' as const,
    content: { ...input },
  };
}
