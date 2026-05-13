import { Navigate, useParams } from 'react-router-dom';

export function RedirectToDeveloperThread() {
  const params = useParams();
  const threadId = params.threadId ?? '';
  if (threadId.length === 0) {
    return <Navigate to="/developer/agents/thread-log" replace />;
  }
  const base = `/developer/agents/thread-log/${encodeURIComponent(threadId)}`;
  const target = params.orderId === undefined ? base : `${base}/${params.orderId}`;
  return <Navigate to={target} replace />;
}
