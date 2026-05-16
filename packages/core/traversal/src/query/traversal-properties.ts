import { basename } from 'node:path';
import type { TraversalNodeRecord, TraversalPropertyName, TraversalPropertyValue } from '../types';

export class TraversalProperties {
  public read(record: TraversalNodeRecord, name: string): TraversalPropertyValue {
    if (!this.validProperties(record).has(name)) {
      throw new Error(`Property ${name} is not valid for ${record.kind} node ${record.name}.`);
    }

    if (name === 'children') {
      return [...record.childIds];
    }
    if (name === 'async') {
      return record.async;
    }
    if (name === 'commentContent') {
      return record.commentContent;
    }
    if (name === 'destructured') {
      return record.destructured;
    }
    if (name === 'fileName') {
      return record.path ? basename(record.path) : record.name;
    }
    if (name === 'type') {
      return record.kind === 'token' && record.token ? `token:${record.token}` : record.kind;
    }
    if (name === 'path') {
      return record.path;
    }
    if (name === 'kind') {
      return record.kind;
    }
    if (name === 'lines') {
      return this.lines(record);
    }
    if (name === 'functionKind') {
      return record.functionKind;
    }
    if (name === 'importPath') {
      return record.importPath;
    }
    if (name === 'name') {
      return record.name;
    }
    if (name === 'propertyName') {
      return record.propertyName;
    }

    return this.recordProperty(record, name as TraversalPropertyName);
  }

  private recordProperty(record: TraversalNodeRecord, name: TraversalPropertyName) {
    switch (name) {
      case 'end':
        return record.end;
      case 'endColumn':
        return record.endColumn;
      case 'endLine':
        return record.endLine;
      case 'line':
        return record.line;
      case 'start':
        return record.start;
      case 'startColumn':
        return record.startColumn;
      case 'startLine':
        return record.startLine;
      case 'text':
        return record.text;
      case 'token':
        return record.token;
      default:
        throw new Error(`Property ${name} is not valid for ${record.kind} node ${record.name}.`);
    }
  }

  private validProperties(record: TraversalNodeRecord) {
    const common = new Set<string>(['children', 'kind', 'name', 'type']);
    if (record.path !== undefined) {
      common.add('path');
    }
    if (record.kind === 'file') {
      common.add('fileName');
      common.add('lines');
      common.add('text');
    }
    if (record.kind === 'token') {
      for (const property of [
        'end',
        'endColumn',
        'endLine',
        'line',
        'lines',
        'start',
        'startColumn',
        'startLine',
        'text',
        'token',
      ] as const) {
        common.add(property);
      }
      if (record.importPath !== undefined) {
        common.add('importPath');
      }
      if (record.functionKind !== undefined) {
        common.add('functionKind');
      }
      if (record.async !== undefined) {
        common.add('async');
      }
      if (record.commentContent !== undefined) {
        common.add('commentContent');
      }
      if (record.destructured !== undefined) {
        common.add('destructured');
      }
      if (record.propertyName !== undefined) {
        common.add('propertyName');
      }
    }
    return common;
  }

  private lines(record: TraversalNodeRecord) {
    return record.text?.split('\n').length;
  }
}
