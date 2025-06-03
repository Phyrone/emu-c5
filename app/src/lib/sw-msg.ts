import {z} from 'zod';

export const ServiceWorkerSkipWaiting = z.object({
	type: z.literal('SKIP_WAITING'),
});
export type ServiceWorkerSkipWaiting = z.infer<typeof ServiceWorkerSkipWaiting>;

export const ServiceWorkerInstruction = z.discriminatedUnion('type',[ServiceWorkerSkipWaiting]);
export type ServiceWorkerInstruction = z.infer<typeof ServiceWorkerInstruction>;

