import { z } from 'zod/v4';
import type {
  BaseJsonSchema,
  BaseJsonSchemaList,
  MaybeString,
  NullableZodSchema,
  XmlFragment,
  XmlIndent,
} from './types';

export function buildZodXmlExample(rootTag: string, schema: NullableZodSchema): string {
  if (schema === null) {
    return `<${rootTag} />`;
  }

  const jsonSchema = z.toJSONSchema(schema);
  const innerXml = schemaToXml(jsonSchema, 1);

  if (innerXml.value === '') {
    return `<${rootTag} />`;
  }

  return `<${rootTag}>${innerXml.value}</${rootTag}>`;
}

function schemaToXml(schema: BaseJsonSchema, indent: XmlIndent): XmlFragment {
  if (typeof schema === 'boolean') {
    return {
      value: `<![CDATA[${schema}]]>`,
      comment: undefined,
    };
  }

  if ('$ref' in schema && schema.$ref !== undefined) {
    return {
      value: '<![CDATA[reference]]>',
      comment: schema.$ref,
    };
  }

  if ('anyOf' in schema && Array.isArray(schema.anyOf)) {
    return unionToXml(schema.anyOf);
  }

  const description = readDescription(schema);

  if (schema.type === 'object') {
    return objectToXml(schema, indent);
  }

  if (schema.type === 'array') {
    return arrayToXml(schema, indent);
  }

  if (schema.type === 'string') {
    return stringToXml(schema, description);
  }

  if (schema.type === 'number' || schema.type === 'integer') {
    return {
      value: '<![CDATA[number]]>',
      comment: description,
    };
  }

  if (schema.type === 'boolean') {
    return {
      value: '<![CDATA[true|false]]>',
      comment: description,
    };
  }

  return {
    value: '<![CDATA[value]]>',
    comment: description,
  };
}

function objectToXml(schema: BaseJsonSchema, indent: XmlIndent): XmlFragment {
  if (typeof schema === 'boolean' || schema.type !== 'object') {
    return {
      value: '',
      comment: undefined,
    };
  }

  const lines: string[] = [];
  const indentText = '  '.repeat(indent);
  const required = new Set(Array.isArray(schema.required) ? schema.required : []);

  for (const [key, value] of Object.entries(schema.properties ?? {})) {
    const result = schemaToXml(value as BaseJsonSchema, indent + 1);
    const optional = required.has(key) ? '' : ' optional';

    if (result.comment !== undefined) {
      lines.push(`${indentText}<!-- ${result.comment} -->`);
    }

    lines.push(`${indentText}<${key}${optional}>${result.value}</${key}>`);
  }

  addAdditionalProperties(lines, schema, indent);

  if (lines.length === 0) {
    return {
      value: '',
      comment: readDescription(schema),
    };
  }

  return {
    value: `\n${lines.join('\n')}\n${'  '.repeat(indent - 1)}`,
    comment: readDescription(schema),
  };
}

function addAdditionalProperties(lines: string[], schema: BaseJsonSchema, indent: XmlIndent): void {
  if (typeof schema === 'boolean' || typeof schema.additionalProperties !== 'object') {
    return;
  }

  const indentText = '  '.repeat(indent);
  const result =
    Object.keys(schema.additionalProperties).length === 0
      ? {
          value: '<![CDATA[unknown]]>',
          comment: undefined,
        }
      : schemaToXml(schema.additionalProperties, indent + 1);

  if (result.comment !== undefined) {
    lines.push(`${indentText}<!-- ${result.comment} -->`);
  }

  lines.push(`${indentText}<myCustomKey>${result.value}</myCustomKey>`);
  lines.push(`${indentText}<!-- repeat as needed with any key names -->`);
}

function arrayToXml(schema: BaseJsonSchema, indent: XmlIndent): XmlFragment {
  if (
    typeof schema === 'boolean' ||
    schema.type !== 'array' ||
    typeof schema.items !== 'object' ||
    Array.isArray(schema.items)
  ) {
    return {
      value: '',
      comment: undefined,
    };
  }

  const indentText = '  '.repeat(indent);
  const result = schemaToXml(schema.items, indent + 1);
  const lines: string[] = [];

  if (result.comment !== undefined) {
    lines.push(`${indentText}<!-- ${result.comment} -->`);
  }

  lines.push(`${indentText}<item>${result.value}</item>`);
  lines.push(`${indentText}<!-- repeat <item> as needed -->`);

  return {
    value: `\n${lines.join('\n')}\n${'  '.repeat(indent - 1)}`,
    comment: undefined,
  };
}

function stringToXml(schema: BaseJsonSchema, description: MaybeString): XmlFragment {
  if (typeof schema === 'boolean') {
    return {
      value: '<![CDATA[string]]>',
      comment: description,
    };
  }

  if ('const' in schema && schema.const !== undefined) {
    return {
      value: `<![CDATA[${String(schema.const)}]]>`,
      comment: description,
    };
  }

  if ('enum' in schema && Array.isArray(schema.enum)) {
    return {
      value: `<![CDATA[${schema.enum.join('|')}]]>`,
      comment: description,
    };
  }

  return {
    value: '<![CDATA[string]]>',
    comment: description,
  };
}

function unionToXml(options: BaseJsonSchemaList): XmlFragment {
  const values = options.map((option) => readConstValue(option)).filter((value) => value !== undefined);

  if (values.length > 0) {
    return {
      value: `<![CDATA[${values.join('|')}]]>`,
      comment: undefined,
    };
  }

  return {
    value: '<![CDATA[value]]>',
    comment: 'one of the allowed schema variants',
  };
}

function readConstValue(option: BaseJsonSchema): MaybeString {
  if (typeof option !== 'object' || option === null || !('const' in option)) {
    return undefined;
  }

  return String(option.const);
}

function readDescription(schema: BaseJsonSchema): MaybeString {
  if (typeof schema === 'boolean') {
    return undefined;
  }

  return typeof schema.description === 'string' ? schema.description : undefined;
}
