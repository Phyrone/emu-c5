<script lang="ts">
    import {ScanFaceIcon, XIcon, LogInIcon} from '@lucide/svelte';
    import {
        browserSupportsWebAuthn,
        startRegistration,
        startAuthentication
    } from '@simplewebauthn/browser';
    import {enhance} from '$app/forms';
    import {encode as msgpEncode} from '@msgpack/msgpack';
    import {type SignInRequest, SignInResponse, WebAuthNChallengeResponse} from '$lib/schemas/auth';
    import {parseResponse} from "$lib/utils";
    import {onDestroy, onMount} from "svelte";
    import {browser} from "$app/environment";

    let {email, password, remember_me} = $state({
        email: '',
        password: '',
        remember_me: false
    });
    let allow_sign_in = $derived(email.length > 0 && password.length > 0);

    async function signin(event: SubmitEvent) {
        event.preventDefault();
        if (!allow_sign_in) {
            return;
        }

        const auth_response = await fetch('/api/v1/auth/sign-in', {
            body: msgpEncode([email, password, remember_me] satisfies SignInRequest),
            method: 'POST',
            headers: {
                'Content-Type': 'application/msgpack',
                Accept: 'application/msgpack'
            }
        }).then((res) => parseResponse(res, SignInResponse));
        console.log(auth_response);
    }

    let webauthn_supported = !browser || browserSupportsWebAuthn() ;

    async function signin_webauthn(event: Event) {
        event.preventDefault();
        try {
            await webauthn_request(false)
        } finally {
            trigger_conditional_ui()
        }


    }

    async function webauthn_request(
        conditional_ui: boolean,
    ) {
        const [challenge] = await fetch('/api/v1/auth/webauthn-challenge', {})
            .then((res) => parseResponse(res, WebAuthNChallengeResponse))

        const request = await startAuthentication({
            optionsJSON: {
                challenge,
                userVerification: conditional_ui ? 'preferred' : 'required',
            },
            useBrowserAutofill: conditional_ui,
        });
        console.log(request);


    }

    function trigger_conditional_ui() {
        // This function is used to trigger the conditional UI for webauthn
        // It is called when the user clicks on the Passkey button
        webauthn_request(true)
            .catch((err) =>{
                console.debug('[WebAuthn] Conditional UI request failed', err);
            });
    }

    onMount(async () => {
        if (!webauthn_supported) {
            return;
        }
        trigger_conditional_ui()
    })
</script>

<div class="grid h-full w-full place-items-center bg-base-100 sm:bg-base-200">
    <div class="w-full sm:max-w-96 sm:w-full bg-base-100  sm:shadow-lg px-10 py-10 sm:px-8 sm:py-6 transition-all">
        <!-- html ids are just placed so password managers can find the fields -->
        <form class="flex flex-col gap-4 sm:gap-6" onsubmit={signin}>
            <label class="floating-label">
                <span class="select-none">Username or Email</span>
                <input
                        bind:value={email}
                        required
                        id="email"
                        type="text"
                        autocomplete="email webauthn"
                        placeholder="Username or Email"
                        class="input input-lg sm:input-md w-full"
                />
            </label>
            <label class="floating-label">
                <span class="select-none">Password</span>
                <input
                        bind:value={password}
                        required
                        id="password"
                        type="password"
                        autocomplete="current-password webauthn"
                        placeholder="Password"
                        class="input input-lg sm:input-md w-full"
                />
            </label>
            <label class="label">
                <input type="checkbox" bind:checked={remember_me} class="toggle toggle-lg sm:toggle-md toggle-success"/>
                <span class="select-none text-lg sm:text-md">Remember me</span>
            </label>

            <button disabled={!allow_sign_in} class="btn btn-primary w-full btn-lg sm:btn-md" type="submit">
                <LogInIcon/>
                Sign In
            </button>
        </form>
        {#if webauthn_supported}
            <span class="divider">Using Passkey</span>
            <button class="btn btn-secondary w-full btn-lg sm:btn-md" onclick={signin_webauthn}>
                <ScanFaceIcon/>
                Passkey
            </button>
        {/if}
    </div>
</div>
