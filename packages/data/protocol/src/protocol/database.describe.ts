export interface DatabaseTableDescription {
  name: string;
  rowCount: number;
  sizeBytes: number;
}

export interface DatabaseDescribeOperation {
  name: 'describeDatabase';
  request: Record<string, never>;
  response: {
    path: string;
    tables: DatabaseTableDescription[];
  };
}
