import type { z } from 'zod/v4';
import type { JSONSchema } from 'zod/v4/core';

export type BaseJsonSchema = JSONSchema.BaseSchema;

export type BaseJsonSchemaList = BaseJsonSchema[];

export type CommentList = CommentText[];

export type CommentText = string | undefined;

export type EntryBlocks = string[][];

export type ExampleJsonValue = ExampleJsonPrimitive | ExampleJsonList | ExampleJsonRecord;

export type ExampleJsonList = ExampleJsonValue[];

export type MaybeExampleJsonList = ExampleJsonList | undefined;

export type MaybeExampleJsonValue = ExampleJsonValue | undefined;

export type MaybeBaseJsonSchema = BaseJsonSchema | undefined;

export type MaybeString = string | undefined;

export type ExampleJsonPrimitive = string | number | boolean | null;

export type ExampleJsonRecord = {
  [key: string]: ExampleJsonValue;
};

export type NullableZodSchema = z.ZodType | null;

export type RenderedLines = string[];

export type SchemaRefs = Set<string>;

export type SerializerInput = NullableZodSchema;

export type SerializerPath = string[];

export type SerializerValue = ExampleJsonValue;

export type SerializerValueList = ExampleJsonList;

export type SerializerValueRecord = ExampleJsonRecord;

export type UnionValue = BaseJsonSchema | ExampleJsonValue;

export type UnionValues = UnionValue[];

export type JsonReferenceValue = BaseJsonSchema | ExampleJsonValue | undefined;

export interface JsonReferenceObject {
  [key: string]: JsonReferenceValue;
}

export type XmlIndent = number;

export interface SerializeXmlOptions {
  rootTag: string;
}

export interface JsonExampleNode {
  comment: CommentText;
  lines: RenderedLines;
  value: ExampleJsonValue;
}

export interface JsonExampleResult {
  text: string;
  value: ExampleJsonValue;
}

export type JsonSchemaArray = BaseJsonSchema;

export type JsonSchemaObject = BaseJsonSchema;

export interface SerializeToonNode {
  key: string;
  value: SerializerValue;
  path: SerializerPath;
}

export interface XmlFragment {
  value: string;
  comment: CommentText;
}
