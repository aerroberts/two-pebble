export type PebbleJsonPrimitive = boolean | null | number | string;

export type PebbleJsonValue = PebbleJsonPrimitive | PebbleJsonList | PebbleJsonRecord;

export type PebbleJsonList = PebbleJsonValue[];

/**
 * Records permit `undefined` values because TypeScript optional properties
 * yield `undefined` and `JSON.stringify` drops those keys at serialization
 * time. Round-tripping through the trace store therefore loses nothing —
 * the persisted shape and the in-memory shape line up.
 */
export type PebbleJsonRecord = {
  [key: string]: PebbleJsonValue | undefined;
};

export type PebbleDataRecord = object;
