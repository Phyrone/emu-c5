import {invalidate, invalidateAll} from '$app/navigation';
import {building} from '$app/environment';
import ms from 'ms';
import {z} from 'zod';
import {decodeAsync as msgPackDecodeAsync} from '@msgpack/msgpack';
import {ProblemDetails} from '$lib/problem';

export function throwifyBundled<T>(bundle: { data: T; error: unknown }): T {
    return throwify(bundle.data, bundle.error);
}

export function throwify<T>(data: T, error: unknown) {
    if (error) {
        if (typeof error === 'object' && 'status' in error && error.status === 401) {
            console.log('[error handler] got 401, refreshing session data');
            invalidate_and_broadcast('auth:session').then();
        }
        throw error;
    } else {
        return data;
    }
}

export const invalidator_broadcast = new BroadcastChannel('kit::invalidate');
invalidator_broadcast.onmessage = async (event) => {
    if (event.data === 'all') {
        await invalidateAll();
    } else if (typeof event.data === 'string') {
        await invalidate(event.data);
    }
};

export async function invalidate_and_broadcast(url: string, broadcast = true) {
    if (broadcast) {
        invalidator_broadcast.postMessage(url);
    }
    await invalidate(url);
}

export function parseBigBase36(value: string): bigint {
    // Check for negative sign
    const isNegative = value.startsWith('-');
    const val = isNegative ? value.slice(1) : value;

    let result = 0n;
    for (const char of val.toLowerCase()) {
        const digit = '0123456789abcdefghijklmnopqrstuvwxyz'.indexOf(char);
        if (digit === -1) {
            throw new Error(`Invalid base36 character: ${char}`);
        }
        result = result * 36n + BigInt(digit);
    }

    return isNegative ? -result : result;
}

class BuildtimeAccessProhibitedError extends Error {
    constructor() {
        super('This function cannot be called during build time.');
        this.name = 'BuildtimeAccessProhibitedError';
    }
}

export function sleep(delay: number | ms.StringValue): Promise<void> {
    // noinspection SuspiciousTypeOfGuard
    const milliseconds = typeof delay === 'string' ? ms(delay as ms.StringValue) : delay;

    if (milliseconds < 0) {
        return Promise.resolve();
    }
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
    });
}

export function lazy<T>(
    fn: () => Promise<T> | T,
    prohibit_prerender: boolean = true
): () => Promise<T> {
    let called = false;
    let result: Promise<T> | T;

    return prohibit_prerender && building
        ? () => {
            throw new BuildtimeAccessProhibitedError();
        }
        : async () => {
            if (!called) {
                called = true;
                result = fn();
            }
            return result;
        };
}

export function todo(message?: string): never {
    if (message === undefined) {
        message = 'TODO: Implement this function';
    }
    throw new Error(`UNIMPLEMENTED: ${message}`);
}

export class MissingResponseBodyError extends Error {
    constructor() {
        super('Response body is missing');
        this.name = 'MissingResponseBodyError';
    }
}

export class UnsupportedContentTypeError extends Error {
    constructor(public readonly contentType: string) {
        super(`Unsupported Content-Type: ${contentType}`);
        this.name = 'UnsupportedContentTypeError';
    }
}

export function responseErrorSchemaError(
    maybeZodError: unknown,
    expected: z.ZodTypeAny,
    received: unknown
): never {
    if (maybeZodError instanceof z.ZodError) {
        throw new UnexpectedResponseSchemaError(expected, received, maybeZodError);
    } else {
        throw maybeZodError;
    }
}

export class UnexpectedResponseSchemaError extends Error {
    constructor(
        public readonly expected: z.ZodTypeAny,
        public readonly received: unknown,
        public readonly zodError: z.ZodError
    ) {
        super(
            `Expected response schema ${expected.toString()}, but received ${JSON.stringify(received)}`
        );
        this.name = 'UnexpectedResponseSchemaError';
    }
}

export class ProblemResponseError extends Error {
    constructor(public readonly problem: ProblemDetails) {
        super(problem.type);
        this.name = 'ProblemResponseError';
    }
}

export async function parseResponse<T extends z.ZodTypeAny>(
    response: Response,
    schema: T
): Promise<z.infer<T>> {

    const content_type = response.headers.get('Content-Type');
    if (!response.body) {
        todo();
    }

    let response_data: unknown;
    switch (content_type) {
        case 'application/json':
            response_data = await response.json();
            break;
        case 'application/problem+json':
            let problem = await response
                .json()
                .then((json) =>
                    ProblemDetails.parseAsync(json).catch((e) =>
                        responseErrorSchemaError(e, ProblemDetails, json)
                    )
                );
            throw new ProblemResponseError(problem);
        case 'application/msgpack':
        case 'application/x-msgpack':
            response_data = await msgPackDecodeAsync(response.body);
            break;
        default:
            throw new UnsupportedContentTypeError(content_type ?? '<absent>');
    }
    return await schema.parseAsync(response_data)
        .catch((e) => responseErrorSchemaError(e, schema, response_data));
}
