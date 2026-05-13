const EXTENSION_MAP: Record<string, string> = {
  ts: 'typescript',
  tsx: 'tsx',
  js: 'javascript',
  jsx: 'jsx',
  json: 'json',
  py: 'python',
  rb: 'ruby',
  rs: 'rust',
  go: 'go',
  java: 'java',
  sh: 'bash',
  bash: 'bash',
  zsh: 'bash',
  yml: 'yaml',
  yaml: 'yaml',
  md: 'markdown',
  css: 'css',
  html: 'markup',
  xml: 'markup',
  sql: 'sql',
  toml: 'toml',
};

export function inferLanguage(title?: string) {
  if (!title) {
    return 'plaintext';
  }
  const ext = title.split('.').pop()?.toLowerCase();
  if (!ext) {
    return 'plaintext';
  }
  return EXTENSION_MAP[ext] ?? 'plaintext';
}
