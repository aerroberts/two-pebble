export interface DatabaseQueryRow {
  [column: string]: boolean | null | number | string;
}

export interface DatabaseRunQueryOperation {
  name: 'runDatabaseQuery';
  request: {
    query: string;
  };
  response: {
    columns: string[];
    rows: DatabaseQueryRow[];
    rowsAffected: number;
  };
}
