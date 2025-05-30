import {produce} from 'sveltekit-sse';
import type {RequestHandler} from './$types';

export const GET: RequestHandler = () => {
    return produce(({emit, lock,source}) => {
        emit('message','hello world');


    },{
        stop({}) {

        }

    });
};
export const POST: RequestHandler = GET;