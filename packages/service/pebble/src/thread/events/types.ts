import type { Event } from './event';

export type ConversationEvent = ReturnType<(typeof Event)[keyof typeof Event]>;
