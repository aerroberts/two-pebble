export function getOpenFileCommand(filePath: string) {
  if (process.platform === 'darwin') {
    return ['open', filePath];
  }

  if (process.platform === 'win32') {
    return ['cmd', '/c', 'start', '', filePath];
  }

  return ['xdg-open', filePath];
}
