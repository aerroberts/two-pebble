import type { TaskListNode } from './tree';

export function collectFlatTaskOrder(nodes: TaskListNode[]): string[] {
  const order: string[] = [];
  walk(nodes, order);
  return order;
}

function walk(nodes: TaskListNode[], order: string[]): void {
  for (const node of nodes) {
    if (node.kind === 'task') {
      order.push(node.id);
    } else {
      walk(node.children, order);
    }
  }
}
