import { z } from 'zod/v4';
import type { ToolInput, ToolInputRecord } from './tool-input';

interface JsonSchemaNode {
  type?: string;
  properties?: Record<string, JsonSchemaNode>;
  items?: JsonSchemaNode;
  anyOf?: JsonSchemaNode[];
  oneOf?: JsonSchemaNode[];
}

/**
 * Best-effort coercion of parsed tool input to match a Zod schema's
 * expected primitive types. Walks `value` alongside the schema's JSON
 * Schema representation and, at every leaf, converts a string into a
 * number or boolean when the schema declares one of those types. Objects
 * and arrays recurse; unknown branches are left untouched so the final
 * `safeParse` produces a clear diagnostic instead of getting swallowed.
 *
 * Tool inputs come from JSON the model wrote, where everything arrives as
 * a string. Without this shim a Zod number field rejects "0" / "3000"
 * outright, even though the model's intent is obvious.
 */
export function coerceToSchema(schema: z.ZodType, value: ToolInput): ToolInput {
  const jsonSchema = z.toJSONSchema(schema) as JsonSchemaNode;
  return coerce(jsonSchema, value);
}

function coerce(node: JsonSchemaNode, value: ToolInput): ToolInput {
  if (Array.isArray(node.anyOf)) {
    return coerceUnion(node.anyOf, value);
  }
  if (Array.isArray(node.oneOf)) {
    return coerceUnion(node.oneOf, value);
  }
  if (node.type === 'number' || node.type === 'integer') {
    return coerceNumber(value);
  }
  if (node.type === 'boolean') {
    return coerceBoolean(value);
  }
  if (node.type === 'object') {
    return coerceObject(node, value);
  }
  if (node.type === 'array') {
    return coerceArray(node, value);
  }
  return value;
}

function coerceUnion(branches: JsonSchemaNode[], value: ToolInput): ToolInput {
  for (const branch of branches) {
    const next = coerce(branch, value);
    if (next !== value) {
      return next;
    }
  }
  return value;
}

function coerceNumber(value: ToolInput): ToolInput {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return value;
  }
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : value;
}

function coerceBoolean(value: ToolInput): ToolInput {
  if (typeof value !== 'string') {
    return value;
  }
  const lower = value.trim().toLowerCase();
  if (lower === 'true') {
    return true;
  }
  if (lower === 'false') {
    return false;
  }
  return value;
}

function coerceObject(node: JsonSchemaNode, value: ToolInput): ToolInput {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return value;
  }
  const properties = node.properties;
  if (properties === undefined) {
    return value;
  }
  const result: ToolInputRecord = {};
  const input = value as ToolInputRecord;
  for (const [key, child] of Object.entries(input)) {
    const childSchema = properties[key];
    result[key] = childSchema === undefined ? child : coerce(childSchema, child);
  }
  return result;
}

function coerceArray(node: JsonSchemaNode, value: ToolInput): ToolInput {
  if (!Array.isArray(value)) {
    return value;
  }
  const items = node.items;
  if (items === undefined) {
    return value;
  }
  return value.map((entry) => coerce(items, entry));
}
