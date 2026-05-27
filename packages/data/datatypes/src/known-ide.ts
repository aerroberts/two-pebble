export type IdeKind = 'vscode' | 'zed' | 'cursor' | 'other';

export interface KnownIde {
  kind: IdeKind;
  displayName: string;
  executablePath: string;
}

export type KnownIdeRecord = KnownIde & {
  id: string;
  createdAt: number;
  updatedAt: number;
};
