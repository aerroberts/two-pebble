import { encode as toonEncode } from '@toon-format/toon';
import { buildZodJsonExample } from './build-zod-json-example';
import { buildZodXmlExample } from './build-zod-xml-example';
import type { ExampleJsonRecord, ExampleJsonValue, NullableZodSchema, SerializeXmlOptions } from './types';

/**
 * Serializes Zod schemas into prompt-facing example data.
 * JSON, XML, and TOON outputs all come from the same schema-derived example value.
 */
export class DataSerializer {
  /**
   * Builds the schema example as structured data.
   * Null schemas represent tools with no input and return an empty object.
   */
  public toValue(schema: NullableZodSchema): ExampleJsonValue {
    return buildZodJsonExample(schema).value;
  }

  /**
   * Serializes a Zod schema as commented JSON.
   * Field descriptions and optional markers are rendered as line comments.
   */
  public toJson(schema: NullableZodSchema): string {
    return buildZodJsonExample(schema).text;
  }

  /**
   * Serializes a Zod schema as XML.
   * The provided root tag represents the custom Pebble tool tag.
   */
  public toXml(schema: NullableZodSchema, options: SerializeXmlOptions): string {
    return buildZodXmlExample(options.rootTag, schema);
  }

  /**
   * Serializes a Zod schema as TOON.
   * Primitive and array examples are wrapped under value before encoding.
   */
  public toToon(schema: NullableZodSchema): string {
    return toonEncode(this.toToonObject(this.toValue(schema)));
  }

  private toToonObject(value: ExampleJsonValue): ExampleJsonRecord {
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      return value;
    }

    return {
      value,
    };
  }
}
