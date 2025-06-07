<script lang="ts">
	import {
		browserSupportsWebAuthn,
		startRegistration,
		startAuthentication
	} from '@simplewebauthn/browser';
	import {encode as msgpEncode} from '@msgpack/msgpack';

	function signin_webauthn(event: Event) {
		event.preventDefault();
		const body = msgpEncode(
			{
                username: 'testuser',
            },
			{
				useBigInt64: true
			}
		);
		fetch('/api/v1/auth/sign-in', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/msgpack',
                'Accept': 'application/msgpack',
			},
            body
		});
	}
</script>

<button class="btn" onclick={signin_webauthn}>Login</button>
