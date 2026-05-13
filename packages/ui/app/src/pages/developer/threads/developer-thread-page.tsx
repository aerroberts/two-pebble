import { type ThreadSnapshotLoadStatus, ThreadSnapshotPage as ThreadSnapshotView } from '@two-pebble/components';
import type { ThreadSnapshotCellRecord } from '@two-pebble/realtime';
import { useReadThreadSnapshot } from '@two-pebble/realtime';
import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { parseCellOrderId } from './thread-route';

export function DeveloperThreadPage() {
  const params = useParams();
  const threadId = params.threadId ?? '';
  const orderIdParam = params.orderId;
  const orderId = parseCellOrderId(orderIdParam);
  const readThreadSnapshot = useReadThreadSnapshot();
  const navigate = useNavigate();
  const [status, setStatus] = useState<ThreadSnapshotLoadStatus>('idle');
  const [cells, setCells] = useState<ThreadSnapshotCellRecord[]>([]);

  useEffect(() => {
    if (threadId.length === 0) {
      return;
    }

    setStatus('loading');
    void readThreadSnapshot({ orderId: orderId ?? undefined, threadId })
      .then((snapshot) => {
        setCells(snapshot.items);
        setStatus('ready');
      })
      .catch(() => {
        setCells([]);
        setStatus('error');
      });
  }, [orderId, readThreadSnapshot, threadId]);

  if (threadId.length === 0 || (orderIdParam !== undefined && orderId === null)) {
    return <Navigate to="/developer/threads" replace />;
  }

  return (
    <ThreadSnapshotView
      orderId={orderId}
      cells={cells}
      onViewFullThread={() => navigate(`/developer/threads/${encodeURIComponent(threadId)}`)}
      status={status}
    />
  );
}
