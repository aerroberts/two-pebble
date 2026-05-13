const MAX_SUMMARY_LENGTH = 100;

export function summarizeToolInput(toolId: string, input: object): string | undefined {
  const fields = input as Record<string, unknown>;

  switch (toolId) {
    case 'Bash':
    case 'BashOutput': {
      const description = readString(fields.description);
      if (description !== undefined) {
        return description;
      }
      return clip(readString(fields.command));
    }
    case 'Read':
    case 'Edit':
    case 'Write':
    case 'NotebookEdit':
      return readString(fields.file_path) ?? readString(fields.notebook_path);
    case 'Grep': {
      const pattern = readString(fields.pattern);
      const path = readString(fields.path);
      if (pattern === undefined) {
        return undefined;
      }
      return path === undefined ? pattern : `${pattern} in ${path}`;
    }
    case 'Glob':
      return readString(fields.pattern);
    case 'Task':
    case 'Agent':
      return readString(fields.description);
    case 'TodoWrite': {
      const todos = fields.todos;
      if (!Array.isArray(todos)) {
        return undefined;
      }
      return `${todos.length} todo${todos.length === 1 ? '' : 's'}`;
    }
    case 'WebFetch':
      return readString(fields.url);
    case 'WebSearch':
      return readString(fields.query);
    case 'KillShell':
    case 'KillBash':
      return readString(fields.shell_id);
    default:
      return readString(fields.description);
  }
}

function readString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }
  return trimmed;
}

function clip(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value.length <= MAX_SUMMARY_LENGTH) {
    return value;
  }
  return `${value.slice(0, MAX_SUMMARY_LENGTH - 1)}…`;
}
