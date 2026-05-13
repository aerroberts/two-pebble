import { File, FileCode, FileJson, FileText, type LucideIcon } from 'lucide-react';

export interface FileIconProps {
  path: string;
  className?: string;
}

const ICONS: Record<string, LucideIcon> = {
  ts: FileCode,
  tsx: FileCode,
  js: FileCode,
  jsx: FileCode,
  py: FileCode,
  go: FileCode,
  rs: FileCode,
  rb: FileCode,
  java: FileCode,
  sh: FileCode,
  bash: FileCode,
  md: FileText,
  mdx: FileText,
  txt: FileText,
  log: FileText,
  json: FileJson,
};

// Picks a file-type icon from the path's extension. Falls back to the generic File icon.
// Add new mappings as needed when the trace surfaces more file kinds.
export function FileIcon(props: FileIconProps) {
  const ext = props.path.split('.').pop()?.toLowerCase();
  const Component: LucideIcon = (ext ? ICONS[ext] : undefined) ?? File;
  return <Component className={props.className} />;
}
