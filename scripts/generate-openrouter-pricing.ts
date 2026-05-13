#!/usr/bin/env bun
/**
 * Fetches the full OpenRouter model catalog and emits a TypeScript pricing
 * registration file at packages/service/pebble/src/pricing/provider-prices/openrouter.ts.
 *
 * The output keys follow the `openrouter/<modelId>` convention expected by
 * staticPriceCalculator. Token prices are converted from per-token USD to
 * per-million-token (PPM) USD to match StaticPricing.
 *
 * Run with OPENROUTER_API_KEY set:
 *   bun scripts/generate-openrouter-pricing.ts
 */

import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

interface OpenRouterModelPricing {
  prompt?: string;
  completion?: string;
  input_cache_read?: string;
  input_cache_write?: string;
}

interface OpenRouterModel {
  id: string;
  name?: string;
  pricing?: OpenRouterModelPricing;
}

interface OpenRouterModelsResponse {
  data: OpenRouterModel[];
}

const OUTPUT_PATH = resolve(import.meta.dir, '..', 'packages/service/pebble/src/pricing/provider-prices/openrouter.ts');

async function main(): Promise<void> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (apiKey === undefined || apiKey.length === 0) {
    throw new Error('OPENROUTER_API_KEY is required to fetch model pricing.');
  }

  const response = await fetch('https://openrouter.ai/api/v1/models', {
    headers: { authorization: `Bearer ${apiKey}` },
  });
  if (!response.ok) {
    throw new Error(`OpenRouter /models returned ${response.status}: ${await response.text()}`);
  }
  const body = (await response.json()) as OpenRouterModelsResponse;

  const entries = body.data
    .map((model) => buildEntry(model))
    .filter((entry): entry is GeneratedEntry => entry !== undefined)
    .sort((a, b) => a.modelId.localeCompare(b.modelId));

  writeFileSync(OUTPUT_PATH, renderModule(entries));
  console.log(`Wrote ${entries.length} model price entries (of ${body.data.length} models) to ${OUTPUT_PATH}`);
}

interface GeneratedEntry {
  modelId: string;
  displayName: string | undefined;
  inputTokensReadUncachedPPM?: number;
  inputTokensReadCachedPPM?: number;
  inputTokensWriteCachedPPM?: number;
  outputTokensGeneratedPPM?: number;
}

function buildEntry(model: OpenRouterModel): GeneratedEntry | undefined {
  const pricing = model.pricing;
  if (pricing === undefined) {
    return undefined;
  }
  const inputTokensReadUncachedPPM = perTokenToPPM(pricing.prompt);
  const inputTokensReadCachedPPM = perTokenToPPM(pricing.input_cache_read);
  const inputTokensWriteCachedPPM = perTokenToPPM(pricing.input_cache_write);
  const outputTokensGeneratedPPM = perTokenToPPM(pricing.completion);

  if (
    inputTokensReadUncachedPPM === undefined &&
    inputTokensReadCachedPPM === undefined &&
    inputTokensWriteCachedPPM === undefined &&
    outputTokensGeneratedPPM === undefined
  ) {
    return undefined;
  }

  return {
    modelId: model.id,
    displayName: model.name?.trim(),
    inputTokensReadUncachedPPM,
    inputTokensReadCachedPPM,
    inputTokensWriteCachedPPM,
    outputTokensGeneratedPPM,
  };
}

function perTokenToPPM(value: string | undefined): number | undefined {
  if (value === undefined) {
    return undefined;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }
  if (parsed === 0) {
    return 0;
  }
  return roundForDisplay(parsed * 1_000_000);
}

function roundForDisplay(value: number): number {
  const rounded = Math.round(value * 1_000_000) / 1_000_000;
  return Object.is(rounded, -0) ? 0 : rounded;
}

function renderModule(entries: GeneratedEntry[]): string {
  const lines: string[] = [];
  lines.push('// This file is generated. Edit scripts/generate-openrouter-pricing.ts and rerun:');
  lines.push('//   bun scripts/generate-openrouter-pricing.ts');
  lines.push('//');
  lines.push('// Source: https://openrouter.ai/api/v1/models');
  lines.push('// Pricing is converted from per-token USD into per-million-token (PPM) USD.');
  lines.push('');
  lines.push("import type { PriceCalculator } from '../price-calculator';");
  lines.push('');
  lines.push('export function registerOpenRouterPricing(calculator: PriceCalculator) {');
  for (const entry of entries) {
    lines.push(renderEntry(entry));
  }
  lines.push('}');
  lines.push('');
  return lines.join('\n');
}

function renderEntry(entry: GeneratedEntry): string {
  const fields: string[] = [];
  if (entry.inputTokensReadUncachedPPM !== undefined) {
    fields.push(`    inputTokensReadUncachedPPM: ${entry.inputTokensReadUncachedPPM},`);
  }
  if (entry.inputTokensReadCachedPPM !== undefined) {
    fields.push(`    inputTokensReadCachedPPM: ${entry.inputTokensReadCachedPPM},`);
  }
  if (entry.inputTokensWriteCachedPPM !== undefined) {
    fields.push(`    inputTokensWriteCachedPPM: ${entry.inputTokensWriteCachedPPM},`);
  }
  if (entry.outputTokensGeneratedPPM !== undefined) {
    fields.push(`    outputTokensGeneratedPPM: ${entry.outputTokensGeneratedPPM},`);
  }
  const heading = entry.displayName !== undefined ? `  // ${entry.displayName}` : `  // ${entry.modelId}`;
  return [heading, `  calculator.registerPricing('openrouter/${entry.modelId}', {`, ...fields, '  });'].join('\n');
}

await main();
