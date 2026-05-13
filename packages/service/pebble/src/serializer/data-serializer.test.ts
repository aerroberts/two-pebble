import { describe, expect, it } from 'bun:test';
import { z } from 'zod/v4';
import { DataSerializer } from './data-serializer';

describe('feature: data serializer assertions', () => {
  const describedObjectSchema = z.object({
    name: z.string().describe('Display name'),
    enabled: z.boolean().optional(),
  });
  const nestedFileSchema = z.object({
    file: z.object({
      path: z.string(),
    }),
  });

  it('happy: serializes null schemas as empty objects', () => {
    const serializer = new DataSerializer();

    expect(serializer.toValue(null)).toEqual({});
    expect(serializer.toJson(null)).toBe('{}');
    expect(serializer.toXml(null, { rootTag: 'finish' })).toBe('<finish />');
  });

  it('happy: serializes required and optional object fields from Zod', () => {
    const serializer = new DataSerializer();
    const schema = describedObjectSchema;

    expect(serializer.toValue(schema)).toEqual({ name: 'string', enabled: true });
    expect(serializer.toJson(schema)).toContain('// Display name');
    expect(serializer.toXml(schema, { rootTag: 'configure' })).toContain('<enabled optional>');
  });

  it('happy: serializes literals, enums, and unions as concrete examples', () => {
    const serializer = new DataSerializer();

    expect(serializer.toValue(z.literal('apply'))).toBe('apply');
    expect(serializer.toJson(z.enum(['small', 'large']))).toContain('"small" | "large"');
    expect(serializer.toXml(z.union([z.literal('a'), z.literal('b')]), { rootTag: 'choice' })).toBe(
      '<choice><![CDATA[a|b]]></choice>',
    );
  });

  it('happy: serializes arrays and records from Zod schemas', () => {
    const serializer = new DataSerializer();

    expect(serializer.toValue(z.array(z.string()))).toEqual(['string']);
    expect(serializer.toValue(z.record(z.string(), z.number()))).toEqual({
      exampleKey: 123,
    });
  });

  it('happy: serializes TOON from the schema-derived example value', () => {
    const serializer = new DataSerializer();

    expect(serializer.toToon(nestedFileSchema)).toBe('file:\n  path: string');
  });
});
