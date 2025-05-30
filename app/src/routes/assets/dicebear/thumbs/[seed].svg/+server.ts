import type {RequestHandler} from './$types';
import {createAvatar} from '@dicebear/core';
import {thumbs} from '@dicebear/collection';
import {text} from '@sveltejs/kit';
import {apiWrapper, parseRequestQueryError} from '$server/api';
import create_etag from 'etag';
import {z} from 'zod';
import qs from 'qs';

const QueryParams = z.object({
    //not like it matters
    size: z
        .number({coerce: true})
        .int()
        .positive()
        .min(1)
        .optional()
        .catch(() => undefined)
});

export const GET: RequestHandler = apiWrapper(async ({params: {seed}, url}) => {
    let params = await QueryParams.parseAsync(qs.parse(url.search.slice(1)))
        .catch(parseRequestQueryError);

    const avatar = createAvatar(thumbs, {
        seed,
        size: params.size
    });
    const svg = avatar.toString();
    const etag = create_etag(svg, {weak: false});

    return text(svg, {
        headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=31536000, immutable',
            Etag: etag
        }
    });
});
