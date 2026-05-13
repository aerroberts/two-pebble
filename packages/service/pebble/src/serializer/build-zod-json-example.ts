import { z } from 'zod/v4';
import type {
  BaseJsonSchema,
  BaseJsonSchemaList,
  CommentList,
  CommentText,
  EntryBlocks,
  ExampleJsonList,
  ExampleJsonRecord,
  ExampleJsonValue,
  JsonExampleNode,
  JsonExampleResult,
  JsonReferenceObject,
  JsonReferenceValue,
  JsonSchemaArray,
  JsonSchemaObject,
  MaybeBaseJsonSchema,
  MaybeExampleJsonList,
  MaybeExampleJsonValue,
  NullableZodSchema,
  RenderedLines,
  SchemaRefs,
  UnionValue,
  UnionValues,
} from './types';

export function buildZodJsonExample(schema: NullableZodSchema): JsonExampleResult {
  if (schema === null) {
    return {
      text: '{}',
      value: {},
    };
  }

  const jsonSchema = z.toJSONSchema(schema);
  const node = buildNode(jsonSchema, jsonSchema, new Set());

  return {
    text: joinComment(node.comment, node.lines).join('\n'),
    value: node.value,
  };
}

function buildNode(schema: BaseJsonSchema, rootSchema: BaseJsonSchema, refs: SchemaRefs): JsonExampleNode {
  const resolvedSchema = resolveSchema(schema, rootSchema, refs);

  if (typeof resolvedSchema === 'boolean') {
    return scalarNode(String(resolvedSchema), resolvedSchema, undefined);
  }

  const description = readDescription(resolvedSchema);
  const unionOptions = readUnionOptions(resolvedSchema);
  const inlineUnion = readInlineUnionValues(unionOptions);

  if (inlineUnion !== undefined) {
    return scalarNode(renderInlineUnion(inlineUnion), inlineUnion[0] ?? null, description);
  }

  if (unionOptions.length > 0) {
    return withComment(
      buildNode(unionOptions[0] as BaseJsonSchema, rootSchema, refs),
      joinComments(description, describeUnion(unionOptions)),
    );
  }

  if ('const' in resolvedSchema && resolvedSchema.const !== undefined) {
    return scalarNode(JSON.stringify(resolvedSchema.const), literalValue(resolvedSchema.const), description);
  }

  if ('enum' in resolvedSchema && Array.isArray(resolvedSchema.enum) && resolvedSchema.enum.length > 0) {
    return enumNode(resolvedSchema.enum, description);
  }

  if (isObjectSchema(resolvedSchema)) {
    return objectNode(resolvedSchema, rootSchema, refs);
  }

  if (isArraySchema(resolvedSchema)) {
    return arrayNode(resolvedSchema, rootSchema, refs);
  }

  return scalarTypeNode(resolvedSchema, description);
}

function arrayNode(schema: JsonSchemaArray, rootSchema: BaseJsonSchema, refs: SchemaRefs): JsonExampleNode {
  const items = readArrayItems(schema);
  const nodes = items.map((item) => buildNode(item, rootSchema, refs));

  return {
    comment: readDescription(schema),
    lines: wrapBlock(
      '[',
      ']',
      nodes.map((node) => renderArrayItem(node)),
    ),
    value: nodes.map((node) => node.value),
  };
}

function enumNode(values: UnionValues, description: CommentText): JsonExampleNode {
  const inlineEnum = readInlineValues(values);

  if (inlineEnum !== undefined) {
    return scalarNode(renderInlineUnion(inlineEnum), inlineEnum[0] ?? null, description);
  }

  return scalarNode(
    JSON.stringify(values[0]),
    literalValue(values[0]),
    joinComments(description, describeUnion(values)),
  );
}

function objectNode(schema: JsonSchemaObject, rootSchema: BaseJsonSchema, refs: SchemaRefs): JsonExampleNode {
  if (typeof schema === 'boolean') {
    return {
      comment: undefined,
      lines: ['{}'],
      value: {},
    };
  }

  const body: EntryBlocks = [];
  const value: ExampleJsonRecord = {};
  const required = new Set(schema.required ?? []);

  for (const [key, property] of Object.entries(schema.properties ?? {})) {
    const node = buildNode(property as BaseJsonSchema, rootSchema, refs);
    value[key] = node.value;
    body.push(renderObjectEntry(key, node, joinComments(node.comment, required.has(key) ? undefined : 'optional')));
  }

  if (schema.additionalProperties !== undefined && typeof schema.additionalProperties === 'object') {
    const node = buildAdditionalPropertiesNode(schema.additionalProperties, rootSchema, refs);
    value.exampleKey = node.value;
    body.push(renderObjectEntry('exampleKey', node, joinComments(node.comment, 'any key name')));
  }

  return {
    comment: readDescription(schema),
    lines: wrapBlock('{', '}', body),
    value,
  };
}

function buildAdditionalPropertiesNode(
  schema: BaseJsonSchema,
  rootSchema: BaseJsonSchema,
  refs: SchemaRefs,
): JsonExampleNode {
  if (Object.keys(schema).length === 0) {
    return scalarNode(JSON.stringify('value'), 'value', undefined);
  }

  return buildNode(schema, rootSchema, refs);
}

function scalarTypeNode(schema: BaseJsonSchema, description: CommentText): JsonExampleNode {
  if (typeof schema === 'boolean') {
    return scalarNode(String(schema), schema, description);
  }

  if (schema.type === 'string') {
    return scalarNode(JSON.stringify('string'), 'string', description);
  }

  if (schema.type === 'number' || schema.type === 'integer') {
    return scalarNode('123', 123, description);
  }

  if (schema.type === 'boolean') {
    return scalarNode('true', true, description);
  }

  if (schema.type === 'null') {
    return scalarNode('null', null, description);
  }

  return scalarNode(JSON.stringify('value'), 'value', joinComments(description, 'example value'));
}

function renderObjectEntry(key: string, node: JsonExampleNode, comment: CommentText): RenderedLines {
  const [first, ...rest] = node.lines;
  return joinComment(comment, [`"${key}": ${first}`, ...rest.map((line) => `  ${line}`)]);
}

function renderArrayItem(node: JsonExampleNode): RenderedLines {
  const [first, ...rest] = node.lines;
  return joinComment(node.comment, [first ?? '', ...rest.map((line) => `  ${line}`)]);
}

function wrapBlock(open: string, close: string, entries: EntryBlocks): RenderedLines {
  if (entries.length === 0) {
    return [`${open}${close}`];
  }

  const lines = [open];

  for (const [index, entry] of entries.entries()) {
    const block = [...entry];
    const last = block.length - 1;

    if (index < entries.length - 1) {
      block[last] = `${block[last]},`;
    }

    lines.push(...block.map((line) => `  ${line}`));
  }

  lines.push(close);
  return lines;
}

function scalarNode(rendered: string, value: ExampleJsonValue, comment: CommentText): JsonExampleNode {
  return {
    comment,
    lines: [rendered],
    value,
  };
}

function withComment(node: JsonExampleNode, comment: CommentText): JsonExampleNode {
  return {
    ...node,
    comment,
  };
}

function joinComment(comment: CommentText, lines: RenderedLines): RenderedLines {
  if (comment === undefined) {
    return lines;
  }

  return [`// ${comment}`, ...lines];
}

function joinComments(...comments: CommentList): CommentText {
  const parts = comments.filter((comment) => comment !== undefined);
  return parts.length > 0 ? parts.join('; ') : undefined;
}

function describeUnion(values: UnionValues): string {
  return `one of: ${values.map((value) => JSON.stringify(literalValue(value))).join(', ')}`;
}

function readInlineUnionValues(values: UnionValues): MaybeExampleJsonList {
  const inlineValues = values.map(readInlineLiteral);
  return inlineValues.length > 0 && inlineValues.every((value) => value !== undefined) ? inlineValues : undefined;
}

function readInlineValues(values: UnionValues): MaybeExampleJsonList {
  const inlineValues = values.map(readInlineValue);
  return inlineValues.length > 0 && inlineValues.every((value) => value !== undefined) ? inlineValues : undefined;
}

function readInlineLiteral(value: UnionValue): MaybeExampleJsonValue {
  if (typeof value !== 'object' || value === null) {
    return undefined;
  }

  if ('const' in value) {
    return readInlineValue(value.const);
  }

  return undefined;
}

function renderInlineUnion(values: ExampleJsonList): string {
  return values.map((value) => JSON.stringify(value)).join(' | ');
}

function literalValue(value: JsonReferenceValue): ExampleJsonValue {
  const inlineValue = readInlineValue(value);

  if (inlineValue !== undefined) {
    return inlineValue;
  }

  return JSON.stringify(value);
}

function readInlineValue(value: JsonReferenceValue): MaybeExampleJsonValue {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null) {
    return value;
  }

  return undefined;
}

function resolveSchema(schema: BaseJsonSchema, rootSchema: BaseJsonSchema, refs: SchemaRefs): BaseJsonSchema {
  if (typeof schema === 'boolean' || !('$ref' in schema) || schema.$ref === undefined || refs.has(schema.$ref)) {
    return schema;
  }

  const resolved = resolveReference(rootSchema, schema.$ref);

  if (resolved === undefined) {
    return schema;
  }

  refs.add(schema.$ref);
  const next = resolveSchema(resolved, rootSchema, refs);
  refs.delete(schema.$ref);
  return next;
}

function resolveReference(rootSchema: BaseJsonSchema, ref: string): MaybeBaseJsonSchema {
  if (!ref.startsWith('#/')) {
    return undefined;
  }

  let current: JsonReferenceValue = rootSchema;

  for (const part of ref.slice(2).split('/')) {
    if (!isJsonReferenceObject(current)) {
      return undefined;
    }

    current = (current as JsonReferenceObject)[part];
  }

  return isJsonSchema(current) ? (current as BaseJsonSchema) : undefined;
}

function readArrayItems(schema: JsonSchemaArray): BaseJsonSchemaList {
  const items: BaseJsonSchemaList = [];

  if (Array.isArray(schema.items)) {
    for (const item of schema.items) {
      if (isJsonSchema(item)) {
        items.push(item as BaseJsonSchema);
      }
    }

    return items;
  }

  if (schema.items !== undefined && isJsonSchema(schema.items)) {
    return [schema.items as BaseJsonSchema];
  }

  return [];
}

function readDescription(schema: BaseJsonSchema): CommentText {
  if (typeof schema === 'boolean') {
    return undefined;
  }

  return typeof schema.description === 'string' ? schema.description : undefined;
}

function readUnionOptions(schema: BaseJsonSchema): UnionValues {
  if (typeof schema === 'boolean') {
    return [];
  }

  if ('anyOf' in schema && Array.isArray(schema.anyOf)) {
    return schema.anyOf;
  }

  if ('oneOf' in schema && Array.isArray(schema.oneOf)) {
    return schema.oneOf;
  }

  return [];
}

function isObjectSchema(schema: BaseJsonSchema): boolean {
  return typeof schema === 'object' && schema !== null && schema.type === 'object';
}

function isArraySchema(schema: BaseJsonSchema): boolean {
  return typeof schema === 'object' && schema !== null && schema.type === 'array';
}

function isJsonSchema(value: JsonReferenceValue): boolean {
  return typeof value === 'boolean' || (typeof value === 'object' && value !== null);
}

function isJsonReferenceObject(value: JsonReferenceValue): boolean {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
