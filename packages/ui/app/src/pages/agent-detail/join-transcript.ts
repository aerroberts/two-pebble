export function joinTranscript(existing: string, transcript: string): string {
  if (transcript.length === 0) return existing;
  if (existing.length === 0) return transcript;
  return existing.endsWith(' ') ? `${existing}${transcript}` : `${existing} ${transcript}`;
}
