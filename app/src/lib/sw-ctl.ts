import {browser, building, dev} from '$app/environment';
import ms from 'ms';
import {writable} from "svelte/store";
import {sleep} from "$lib/utils";

const SERVICE_WORKER_URL = '/service-worker.js';
const UPDATE_INTERVAL = ms('10s');

export const ready_to_update = writable<ServiceWorker | undefined>(undefined);

async function registerServiceWorker() {
    sessionStorage.getItem('service');
    const registration =
        (await navigator.serviceWorker.getRegistration(SERVICE_WORKER_URL)) ??
        (await navigator.serviceWorker.register(SERVICE_WORKER_URL, {
            type: dev ? 'module' : 'classic'
        }));

    registration.addEventListener('updatefound', (e) => {
        console.log('Service worker update found', e);
        if (!registration.active) {
            return;
        } else if (registration.installing) {
            ready_to_update.set(registration.installing);
        } else if (registration.waiting) {
            ready_to_update.set(registration.waiting);
        }
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
        //console.log('controller changed', {waiting: registration.waiting, active: registration.active});
        window.location.reload();
    });
    const update_check = async () => {
        console.time('Checking for service worker update');
        try {
            await registration.update();

        } finally {

            console.timeEnd('Checking for service worker update');
        }

    }
    setInterval(update_check, UPDATE_INTERVAL);


    if (registration.installing) {
        ready_to_update.set(registration.installing);
    } else if (registration.waiting) {
        ready_to_update.set(registration.waiting);
    } else {
        await update_check();
    }
}

//if (browser && !dev && navigator.serviceWorker) {registerServiceWorker().then();}
