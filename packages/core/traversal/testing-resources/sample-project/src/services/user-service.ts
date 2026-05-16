import { readFile } from 'node:fs/promises';
import type { UserRecord } from '../types/user-record';

export class UserService {
  public constructor(label: string) {
    this.label = this.normalize(label);
  }

  private label: string;

  public static create() {
    return new UserService('default');
  }

  public async load(path: string): Promise<UserRecord> {
    const contents = await readFile(path, 'utf-8');
    const parsed = JSON.parse(contents);
    return { ...parsed, id: this.normalize(parsed.id) };
  }

  private normalize(input: string) {
    return input.toLowerCase();
  }

  public describe() {
    return this.label;
  }
}

export interface UserServiceOptions {
  label: string;
}
