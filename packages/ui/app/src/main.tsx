import { ToastProvider } from '@two-pebble/components';
import { createRoot } from 'react-dom/client';

import '@two-pebble/components/styles.css';

import { MissingRootElementError } from './missing-root-element-error';
import { RealtimeApp } from './realtime-app';
import './styles.css';

const container = document.getElementById('root');

if (container === null) {
  throw new MissingRootElementError('Missing #root mount point in index.html.');
}

createRoot(container).render(
  <ToastProvider>
    <RealtimeApp />
  </ToastProvider>,
);
