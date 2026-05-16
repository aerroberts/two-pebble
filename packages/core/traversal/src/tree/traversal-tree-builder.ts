import { statSync } from 'node:fs';
import { basename, dirname } from 'node:path';
import { TypeScriptTranslator } from '../ast/typescript-translator';
import type { SerializedTraversalTree, TraversalCacheExpandContext, TraversalNodeRecord } from '../types';
import { recordFrom } from './record-utils';

export class TraversalTreeBuilder {
  private readonly translator: TypeScriptTranslator;

  public constructor(private readonly context: TraversalCacheExpandContext) {
    this.translator = new TypeScriptTranslator(context);
  }

  public async build(): Promise<SerializedTraversalTree> {
    const rootId = 'node:0';
    const records: TraversalNodeRecord[] = [
      {
        id: rootId,
        kind: statSync(this.context.rootPath).isDirectory() ? 'folder' : 'file',
        name: basename(this.context.rootPath),
        path: this.context.rootPath,
        childIds: [],
      },
    ];
    const pathIds: [string, string][] = [[this.context.rootPath, rootId]];

    for (const path of this.context.paths.sort()) {
      if (path === this.context.rootPath) {
        continue;
      }

      const record = this.filesystemRecord(path, records.length);
      records.push(record);
      pathIds.push([path, record.id]);
      const parent = records.find((candidate) => candidate.path === dirname(path));
      parent?.childIds.push(record.id);
    }

    for (const record of records.filter((candidate) => candidate.kind === 'file')) {
      this.appendAstRecords(record, records);
    }

    return {
      version: 2,
      rootHash: this.context.rootHash,
      rootId,
      rootPath: this.context.rootPath,
      records,
      pathIds,
    };
  }

  private filesystemRecord(path: string, index: number): TraversalNodeRecord {
    const isDirectory = statSync(path).isDirectory();
    const snapshot = isDirectory ? undefined : this.context.readFile(path);
    return {
      id: `node:${index}`,
      kind: isDirectory ? 'folder' : 'file',
      name: basename(path),
      path,
      text: snapshot?.text,
      childIds: [],
    };
  }

  private appendAstRecords(fileRecord: TraversalNodeRecord, records: TraversalNodeRecord[]) {
    if (!fileRecord.path || !this.translator.supports(fileRecord.path)) {
      return;
    }

    const childIds = this.translator.translate(fileRecord.path, records);
    fileRecord.childIds.push(...childIds);
    for (const childId of childIds) {
      recordFrom(records, childId).parentId = fileRecord.id;
    }
  }
}
