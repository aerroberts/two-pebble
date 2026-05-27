import type { Integration_Anthropic } from './protocol/anthropic';
import type { Integration_Github } from './protocol/github';
import type { Integration_Ollama } from './protocol/ollama';
import type { Integration_OpenAi } from './protocol/openai';
import type { Integration_OpenRouter } from './protocol/openrouter';

export type {
  Integration_Anthropic,
  Integration_Github,
  Integration_Ollama,
  Integration_OpenAi,
  Integration_OpenRouter,
};

export type Integration =
  | Integration_Anthropic
  | Integration_Github
  | Integration_Ollama
  | Integration_OpenAi
  | Integration_OpenRouter;
