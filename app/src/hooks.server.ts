import type {Handle} from '@sveltejs/kit';
import {sequence} from "@sveltejs/kit/hooks";
import {handle as server_html} from "$lib/server/server_html";


export const handle: Handle = sequence(server_html,);
