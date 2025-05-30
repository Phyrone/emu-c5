import { z } from 'zod';

export const SseEventType = z.enum(['ping', 'error', 'hello']);
export type SseEventType = z.infer<typeof SseEventType>;

export const SsePingEvent = z.object({});
export type SsePingEvent = z.infer<typeof SsePingEvent>;

export const SseErrorEvent = z.object({});
export type SseErrorEvent = z.infer<typeof SseErrorEvent>;

export const SseHelloEvent = z.object({});
export type SseHelloEvent = z.infer<typeof SseHelloEvent>;
