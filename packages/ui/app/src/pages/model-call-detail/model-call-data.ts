import type { ModelCallResponseBlock } from '@two-pebble/components';

export type ModelCallDataValue =
  | string
  | number
  | boolean
  | null
  | ModelCallDataValue[]
  | ModelCallDataRecord
  | PriceLineItemRecord;

type OptionalModelCallDataValue = ModelCallDataValue | undefined;
type ModelCallResponseBlocks = ModelCallResponseBlock[];
type PriceLineItems = PriceLineItem[];
type ModelCallDataInput = object;

export interface PriceLineItem {
  id: string;
  timestamp?: number;
  quantity: number;
  price: number;
  total: number;
}

export interface ModelCallData {
  output: ModelCallResponseBlocks;
  prices: PriceLineItems;
  providerInput: ModelCallDataValue;
  providerOutput: ModelCallDataValue;
  thread: string;
}

export function readModelCallData(data: ModelCallDataInput): ModelCallData {
  const record = data as ModelCallDataRecord;
  return {
    output: readProviderOutputBlocks(record.output),
    prices: readPriceLineItems(record.prices),
    providerInput: record.providerInput ?? null,
    providerOutput: record.providerOutput ?? null,
    thread: typeof record.threadCellPointer === 'string' ? record.threadCellPointer : '',
  };
}

function readProviderOutputBlocks(value: OptionalModelCallDataValue): ModelCallResponseBlocks {
  if (!Array.isArray(value)) {
    return [];
  }

  const blocks: ModelCallResponseBlocks = [];

  for (const item of value) {
    if (!isRecord(item)) {
      continue;
    }

    const record = item as ModelCallDataRecord;
    if (typeof record.type !== 'string') {
      continue;
    }

    pushProviderOutputBlock(blocks, record);
  }

  return blocks;
}

function pushProviderOutputBlock(blocks: ModelCallResponseBlocks, item: ModelCallDataRecord) {
  switch (item.type) {
    case 'thinking':
    case 'text':
      if (typeof item.text === 'string') {
        blocks.push({ text: item.text, type: item.type });
      }
      break;
    case 'image':
      if (typeof item.base64Image === 'string') {
        blocks.push({ base64Image: item.base64Image, type: 'image' });
      }
      break;
    case 'tool':
      if (typeof item.callid === 'string' && typeof item.toolid === 'string' && isRecord(item.payload)) {
        blocks.push({
          callid: item.callid,
          payload: item.payload as ModelCallDataRecord,
          toolid: item.toolid,
          type: 'tool',
        });
      }
      break;
    default:
      break;
  }
}

function readPriceLineItems(value: OptionalModelCallDataValue): PriceLineItems {
  if (!Array.isArray(value)) {
    return [];
  }

  const lineItems: PriceLineItems = [];

  for (const item of value) {
    if (isPriceLineItemRecord(item)) {
      lineItems.push(readPriceLineItem(item as PriceLineItemRecord));
    }
  }

  return lineItems;
}

function isPriceLineItemRecord(value: ModelCallDataValue) {
  if (!isRecord(value)) {
    return false;
  }

  const record = value as ModelCallDataRecord;
  return (
    typeof record.id === 'string' &&
    typeof record.quantity === 'number' &&
    typeof record.price === 'number' &&
    typeof record.total === 'number'
  );
}

function readPriceLineItem(item: PriceLineItemRecord): PriceLineItem {
  return {
    id: item.id,
    ...(typeof item.timestamp === 'number' ? { timestamp: item.timestamp } : {}),
    quantity: item.quantity,
    price: item.price,
    total: item.total,
  };
}

function isRecord(value: OptionalModelCallDataValue) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

interface ModelCallDataRecord {
  [key: string]: ModelCallDataValue | undefined;
}

interface PriceLineItemRecord extends ModelCallDataRecord {
  id: string;
  timestamp?: number;
  quantity: number;
  price: number;
  total: number;
}
