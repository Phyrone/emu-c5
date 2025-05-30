import { produce } from 'sveltekit-sse';
import type { RequestHandler } from './$types';
import superjson from 'superjson';
import type { SseEventType, SseHelloEvent } from '$lib/schemas/events';
import ms from 'ms';

export const GET: RequestHandler = () => {
	return produce(
		({ emit, lock, source }) => {
			emit('hello' satisfies SseEventType, superjson.stringify({} satisfies SseHelloEvent));

			lock.set(false);
		},
		{
			ping: ms('10s'),
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				Connection: 'keep-alive',
				'X-Accel-Buffering': 'no'
			},
			stop({ start, pull, cancel }) {}
		}
	);
};
export const POST: RequestHandler = GET;
