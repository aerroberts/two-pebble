import type { SelfContainedProtocol } from './self-contained';

export interface ImportingProtocol {
  name: 'importing';
  request: SelfContainedProtocol;
  response: {
    ok: boolean;
  };
}
