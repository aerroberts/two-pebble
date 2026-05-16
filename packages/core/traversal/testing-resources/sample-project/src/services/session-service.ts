import { randomUUID } from 'node:crypto';

export class SessionService {
  public start() {
    return randomUUID();
  }
}
