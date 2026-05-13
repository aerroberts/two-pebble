export interface ThreadPointer {
  orderId: number;
  threadId: string;
}

type ParsedThreadPointer = ThreadPointer | null;
type ThreadSnapshotPath = string | null;

export function parseThreadPointer(pointer: string): ParsedThreadPointer {
  const separatorIndex = Math.max(pointer.lastIndexOf('/'), pointer.lastIndexOf(':'));

  if (separatorIndex <= 0 || separatorIndex === pointer.length - 1) {
    return null;
  }

  const threadId = pointer.slice(0, separatorIndex);
  const orderId = Number.parseInt(pointer.slice(separatorIndex + 1), 10);

  if (threadId.length === 0 || !Number.isFinite(orderId)) {
    return null;
  }

  return { orderId, threadId };
}

export function threadSnapshotPath(pointer: string): ThreadSnapshotPath {
  const parsed = parseThreadPointer(pointer);

  if (parsed === null) {
    return null;
  }

  return `/developer/threads/${encodeURIComponent(parsed.threadId)}/${parsed.orderId}`;
}
