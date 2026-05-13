import type { SQLiteColumn, SQLiteColumnBuilderBase, SQLiteTableExtraConfigValue } from 'drizzle-orm/sqlite-core';

export type TableColumns = Record<string, SQLiteColumnBuilderBase>;

export type CustomTableIndexColumns = Record<string, SQLiteColumn>;

export type CustomTableConfig = (table: CustomTableIndexColumns) => SQLiteTableExtraConfigValue[];

export type CustomTableConfigInput = [CustomTableConfig] | [];
