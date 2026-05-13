import { describe, it } from 'bun:test';
import { z } from 'zod/v4';
import { expectFileSnapshot } from '../snapshot';
import { DataSerializer } from './data-serializer';
import { renderSchemaSnapshot, type SchemaCase } from './data-serializer.test-env.builder';

describe('feature: data serializer snapshots', () => {
  const schemaCases: SchemaCase[] = [
    ['null-schema', 'null', null],
    ['string', 'z.string()', z.string()],
    ['string-described', 'z.string().describe("A useful string")', z.string().describe('A useful string')],
    ['number', 'z.number()', z.number()],
    ['integer', 'z.int()', z.int()],
    ['boolean', 'z.boolean()', z.boolean()],
    ['literal-string', 'z.literal("apply")', z.literal('apply')],
    ['literal-number', 'z.literal(3)', z.literal(3)],
    ['literal-boolean', 'z.literal(true)', z.literal(true)],
    ['enum-simple', 'z.enum(["small", "large"])', z.enum(['small', 'large'])],
    [
      'union-literals',
      'z.union([z.literal("read"), z.literal("write")])',
      z.union([z.literal('read'), z.literal('write')]),
    ],
    ['array-string', 'z.array(z.string())', z.array(z.string())],
    ['array-number', 'z.array(z.number())', z.array(z.number())],
    ['array-object', 'z.array(z.object({ path: z.string() }))', z.array(z.object({ path: z.string() }))],
    ['record-string', 'z.record(z.string(), z.string())', z.record(z.string(), z.string())],
    [
      'record-object',
      'z.record(z.string(), z.object({ count: z.number() }))',
      z.record(z.string(), z.object({ count: z.number() })),
    ],
    ['object-empty', 'z.object({})', z.object({})],
    [
      'object-required',
      'z.object({ name: z.string(), count: z.number(), enabled: z.boolean() })',
      z.object({
        name: z.string(),
        count: z.number(),
        enabled: z.boolean(),
      }),
    ],
    [
      'object-described',
      'z.object({ name: z.string().describe("Display name") }).describe("User profile")',
      z
        .object({
          name: z.string().describe('Display name'),
        })
        .describe('User profile'),
    ],
    [
      'object-optional',
      'z.object({ required: z.string(), optional: z.string().optional() })',
      z.object({
        required: z.string(),
        optional: z.string().optional(),
      }),
    ],
    [
      'object-nullish',
      'z.object({ maybe: z.string().nullish() })',
      z.object({
        maybe: z.string().nullish(),
      }),
    ],
    [
      'object-nested',
      'z.object({ file: z.object({ path: z.string(), size: z.number() }) })',
      z.object({
        file: z.object({
          path: z.string(),
          size: z.number(),
        }),
      }),
    ],
    [
      'object-array-field',
      'z.object({ paths: z.array(z.string()) })',
      z.object({
        paths: z.array(z.string()),
      }),
    ],
    [
      'object-enum-field',
      'z.object({ mode: z.enum(["read", "write"]).describe("File mode") })',
      z.object({
        mode: z.enum(['read', 'write']).describe('File mode'),
      }),
    ],
    [
      'object-literal-field',
      'z.object({ action: z.literal("replace") })',
      z.object({
        action: z.literal('replace'),
      }),
    ],
    [
      'object-record-field',
      'z.object({ metadata: z.record(z.string(), z.string()) })',
      z.object({
        metadata: z.record(z.string(), z.string()),
      }),
    ],
    [
      'deeply-nested',
      'z.object({ a: z.object({ b: z.object({ c: z.string() }) }) })',
      z.object({
        a: z.object({
          b: z.object({
            c: z.string(),
          }),
        }),
      }),
    ],
    [
      'tool-read-file',
      'z.object({ path: z.string().describe("Workspace-relative path") })',
      z.object({
        path: z.string().describe('Workspace-relative path'),
      }),
    ],
    [
      'tool-write-file',
      'z.object({ path: z.string(), content: z.string(), overwrite: z.boolean().optional() })',
      z.object({
        path: z.string(),
        content: z.string(),
        overwrite: z.boolean().optional(),
      }),
    ],
  ];

  const serializer = new DataSerializer();

  for (const [name, source, schema] of schemaCases) {
    it(`snapshot: json ${name}`, () => {
      expectFileSnapshot(
        renderSchemaSnapshot(source, serializer.toJson(schema)),
        new URL(`./snapshots/json-${name}.snap`, import.meta.url),
      );
    });

    it(`snapshot: xml ${name}`, () => {
      expectFileSnapshot(
        renderSchemaSnapshot(source, serializer.toXml(schema, { rootTag: name })),
        new URL(`./snapshots/xml-${name}.snap`, import.meta.url),
      );
    });

    it(`snapshot: toon ${name}`, () => {
      expectFileSnapshot(
        renderSchemaSnapshot(source, serializer.toToon(schema)),
        new URL(`./snapshots/toon-${name}.snap`, import.meta.url),
      );
    });

    it(`snapshot: value ${name}`, () => {
      expectFileSnapshot(
        renderSchemaSnapshot(source, JSON.stringify(serializer.toValue(schema), null, 2)),
        new URL(`./snapshots/value-${name}.snap`, import.meta.url),
      );
    });
  }
});
