import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import { CommentSectionNode } from './comment-extension';

export function createDocumentNodeExtensions() {
  return [Table.configure({ resizable: false }), TableRow, TableHeader, TableCell, CommentSectionNode];
}
