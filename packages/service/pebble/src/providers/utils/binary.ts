/**
 * Decodes a base64 string into a Uint8Array.
 * Audio providers receive base64-encoded cell content and must hand bytes
 * to fetch's body builders (FormData blobs, raw buffers, etc).
 */
export function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

/**
 * Encodes a Uint8Array into a base64 string.
 * Audio providers receive raw bytes from upstream responses and must store
 * them inside JSON cell content, which forces a base64 round trip.
 */
export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index] ?? 0);
  }
  return btoa(binary);
}
